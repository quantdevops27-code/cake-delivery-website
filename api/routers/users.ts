import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { createRouter, adminQuery } from "../middleware";
import { adminModules } from "@contracts/admin-permissions";
import { getDb } from "../queries/connection";
import { env } from "../lib/env";
import { demoManagedUsers, demoOrders } from "../demo-data";
import { orders, users } from "@db/schema";

const roleSchema = z.enum(["user", "admin", "manager", "supervisor"]);
const statusSchema = z.enum(["active", "inactive", "blocked"]);
const authProviderSchema = z.enum(["mobile", "google", "email", "demo"]);
const permissionSchema = z.enum(adminModules);

const userInput = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  role: roleSchema.default("user"),
  status: statusSchema.default("active"),
  authProvider: authProviderSchema.default("mobile"),
  permissions: z.array(permissionSchema).default([]),
  notes: z.string().trim().optional().or(z.literal("")),
});

const userUpdateInput = userInput.partial().extend({
  id: z.number(),
});

function cleanOptional(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function makeUnionId(input: z.infer<typeof userInput>) {
  const email = cleanOptional(input.email);
  const phone = cleanOptional(input.phone);
  if (email) return `${input.authProvider}:${email.toLowerCase()}`;
  if (phone) return `${input.authProvider}:${phone.replace(/\D/g, "")}`;
  return `${input.authProvider}:user-${Date.now()}`;
}

function enrichDemoUser(user: (typeof demoManagedUsers)[number]) {
  const userOrders = demoOrders.filter((order) => order.userId === user.id);
  return {
    ...user,
    totalOrders: userOrders.length,
    totalSpent: userOrders.reduce((sum, order) => sum + Number(order.total), 0),
  };
}

export const usersRouter = createRouter({
  list: adminQuery
    .input(
      z
        .object({
          search: z.string().optional(),
          role: roleSchema.or(z.literal("all")).default("all"),
          status: statusSchema.or(z.literal("all")).default("all"),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      if (env.demoMode) {
        const query = input?.search?.toLowerCase().trim();
        const filtered = demoManagedUsers
          .map(enrichDemoUser)
          .filter((user) => {
            const matchesSearch = query
              ? [user.name, user.email, user.phone, user.unionId]
                  .filter((value): value is string => typeof value === "string" && value.length > 0)
                  .some((value) => value.toLowerCase().includes(query))
              : true;
            const matchesRole = !input?.role || input.role === "all" || user.role === input.role;
            const matchesStatus =
              !input?.status || input.status === "all" || user.status === input.status;
            return matchesSearch && matchesRole && matchesStatus;
          });

        return {
          items: filtered.slice(offset, offset + limit),
          total: filtered.length,
          page,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        };
      }

      const db = getDb();
      const conditions = [];
      if (input?.search) {
        const pattern = `%${input.search}%`;
        conditions.push(
          sql`(${users.name} LIKE ${pattern} OR ${users.email} LIKE ${pattern} OR ${users.phone} LIKE ${pattern} OR ${users.unionId} LIKE ${pattern})`,
        );
      }
      if (input?.role && input.role !== "all") {
        conditions.push(eq(users.role, input.role));
      }
      if (input?.status && input.status !== "all") {
        conditions.push(eq(users.status, input.status));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select({
          id: users.id,
          unionId: users.unionId,
          name: users.name,
          email: users.email,
          phone: users.phone,
          avatar: users.avatar,
          role: users.role,
          status: users.status,
          authProvider: users.authProvider,
          permissions: users.permissions,
          notes: users.notes,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          lastSignInAt: users.lastSignInAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause);

      const ids = items.map((item) => item.id);
      const orderStats: Record<number, { totalOrders: number; totalSpent: number }> = {};
      if (ids.length > 0) {
        const stats = await db
          .select({
            userId: orders.userId,
            totalOrders: sql<number>`count(*)`,
            totalSpent: sql<string>`COALESCE(sum(${orders.total}), 0)`,
          })
          .from(orders)
          .where(sql`${orders.userId} IN (${sql.join(ids, sql`, `)})`)
          .groupBy(orders.userId);

        for (const stat of stats) {
          const userId = stat.userId ?? 0;
          orderStats[userId] = {
            totalOrders: stat.totalOrders,
            totalSpent: Number(stat.totalSpent),
          };
        }
      }

      return {
        items: items.map((item) => ({
          ...item,
          permissions: Array.isArray(item.permissions)
            ? item.permissions.filter((entry): entry is string => typeof entry === "string")
            : [],
          totalOrders: orderStats[item.id]?.totalOrders ?? 0,
          totalSpent: orderStats[item.id]?.totalSpent ?? 0,
        })),
        total: countResult[0]?.count ?? 0,
        page,
        totalPages: Math.max(1, Math.ceil((countResult[0]?.count ?? 0) / limit)),
      };
    }),

  create: adminQuery.input(userInput).mutation(async ({ input }) => {
    if (env.demoMode) {
      const unionId = makeUnionId(input);
      if (demoManagedUsers.some((user) => user.unionId === unionId)) {
        throw new TRPCError({ code: "CONFLICT", message: "User already exists" });
      }
      const now = new Date();
      const user = {
        id: Math.max(...demoManagedUsers.map((item) => item.id)) + 1,
        unionId,
        name: input.name,
        email: cleanOptional(input.email),
        phone: cleanOptional(input.phone),
        avatar: null,
        role: input.role,
        status: input.status,
        authProvider: input.authProvider,
        permissions: input.role === "admin" ? ["*"] : input.permissions,
        notes: cleanOptional(input.notes) ?? "",
        createdAt: now,
        updatedAt: now,
        lastSignInAt: now,
      };
      demoManagedUsers.unshift(user);
      return enrichDemoUser(user);
    }

    const db = getDb();
    const [created] = await db.insert(users).values({
      unionId: makeUnionId(input),
      name: input.name,
      email: cleanOptional(input.email),
      phone: cleanOptional(input.phone),
      role: input.role,
      status: input.status,
      authProvider: input.authProvider,
      permissions: input.role === "admin" ? ["*"] : input.permissions,
      notes: cleanOptional(input.notes),
      avatar: null,
      lastSignInAt: new Date(),
    });
    return { id: Number(created.insertId), success: true };
  }),

  update: adminQuery.input(userUpdateInput).mutation(async ({ input, ctx }) => {
    if (input.id === ctx.user.id && input.role && input.role !== "admin") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You cannot remove your own admin role.",
      });
    }

    if (env.demoMode) {
      const index = demoManagedUsers.findIndex((user) => user.id === input.id);
      if (index === -1) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      const current = demoManagedUsers[index];
      const updated = {
        ...current,
        name: input.name ?? current.name,
        email: input.email !== undefined ? cleanOptional(input.email) : current.email,
        phone: input.phone !== undefined ? cleanOptional(input.phone) : current.phone,
        role: input.role ?? current.role,
        status: input.status ?? current.status,
        authProvider: input.authProvider ?? current.authProvider,
        permissions:
          input.permissions !== undefined
            ? input.role === "admin"
              ? ["*"]
              : input.permissions
            : input.role === "admin"
              ? ["*"]
              : current.permissions,
        notes: input.notes !== undefined ? cleanOptional(input.notes) ?? "" : current.notes,
        updatedAt: new Date(),
      };
      demoManagedUsers[index] = updated;
      return enrichDemoUser(updated);
    }

    const db = getDb();
    const updates: Partial<typeof users.$inferInsert> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.email !== undefined) updates.email = cleanOptional(input.email);
    if (input.phone !== undefined) updates.phone = cleanOptional(input.phone);
    if (input.role !== undefined) updates.role = input.role;
    if (input.status !== undefined) updates.status = input.status;
    if (input.authProvider !== undefined) updates.authProvider = input.authProvider;
    if (input.permissions !== undefined || input.role === "admin") {
      updates.permissions = input.role === "admin" ? ["*"] : (input.permissions ?? []);
    }
    if (input.notes !== undefined) updates.notes = cleanOptional(input.notes);

    await db.update(users).set(updates).where(eq(users.id, input.id));
    return { id: input.id, success: true };
  }),

  delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (input.id === ctx.user.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You cannot delete your own admin account.",
      });
    }

    if (env.demoMode) {
      const index = demoManagedUsers.findIndex((user) => user.id === input.id);
      if (index === -1) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      demoManagedUsers.splice(index, 1);
      return { success: true };
    }

    const db = getDb();
    await db.delete(users).where(eq(users.id, input.id));
    return { success: true };
  }),
});
