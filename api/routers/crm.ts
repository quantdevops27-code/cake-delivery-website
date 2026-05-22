import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { env } from "../lib/env";
import {
  demoCampaigns,
  demoCustomers,
  demoOrders,
  demoSegments,
} from "../demo-data";
import {
  users,
  orders,
  customerSegments,
  customerSegmentMembers,
  remarketingCampaigns,
  abandonedCarts,
} from "@db/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";

export const crmRouter = createRouter({
  getCustomers: adminQuery
    .input(
      z.object({
        search: z.string().optional(),
        segment: z.number().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const page = input?.page ?? 1;
        const limit = input?.limit ?? 20;
        const query = input?.search?.toLowerCase();
        const filtered = query
          ? demoCustomers.filter((customer) =>
              [customer.name, customer.email, customer.phone]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query)),
            )
          : demoCustomers;
        const offset = (page - 1) * limit;

        return {
          items: filtered.slice(offset, offset + limit),
          total: filtered.length,
          page,
          totalPages: Math.ceil(filtered.length / limit),
        };
      }

      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      let userIds: number[] | undefined;

      if (input?.segment) {
        const members = await db
          .select({ userId: customerSegmentMembers.userId })
          .from(customerSegmentMembers)
          .where(eq(customerSegmentMembers.segmentId, input.segment));
        userIds = members.map((m) => m.userId);
        if (userIds.length === 0) {
          return { items: [], total: 0, page, totalPages: 0 };
        }
      }

      const conditions = [];
      if (input?.search) {
        conditions.push(
          sql`(${users.name} LIKE ${`%${input.search}%`} OR ${users.email} LIKE ${`%${input.search}%`})`
        );
      }
      if (userIds && userIds.length > 0) {
        const validIds = userIds.filter((id): id is number => id !== null);
        if (validIds.length > 0) {
          conditions.push(sql`${users.id} IN (${sql.join(validIds, sql`, `)})`);
        }
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          avatar: users.avatar,
          createdAt: users.createdAt,
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

      const customerIds = items.map((i) => i.id);
      const orderStats: Record<number, { totalOrders: number; totalSpent: number }> = {};

      if (customerIds.length > 0) {
        const stats = await db
          .select({
            userId: orders.userId,
            totalOrders: sql<number>`count(*)`,
            totalSpent: sql<string>`COALESCE(sum(${orders.total}), 0)`,
          })
          .from(orders)
          .where(sql`${orders.userId} IN (${sql.join(customerIds, sql`, `)})`)
          .groupBy(orders.userId);

        for (const s of stats) {
          const uid = s.userId ?? 0;
          orderStats[uid] = { totalOrders: s.totalOrders, totalSpent: Number(s.totalSpent) };
        }
      }

      const itemsWithStats = items.map((item) => {
        const id = item.id ?? 0;
        return {
          ...item,
          totalOrders: orderStats[id]?.totalOrders ?? 0,
          totalSpent: orderStats[id]?.totalSpent ?? 0,
        };
      });

      return {
        items: itemsWithStats,
        total: countResult[0]?.count ?? 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
      };
    }),

  getCustomerDetail: adminQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const user = demoCustomers.find((customer) => customer.id === input.userId);
        if (!user) return null;
        const userOrders = demoOrders.filter((order) => order.userId === input.userId);
        return {
          ...user,
          orders: userOrders,
          totalOrders: userOrders.length,
          totalSpent: userOrders.reduce((sum, order) => sum + Number(order.total), 0),
        };
      }

      const db = getDb();

      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!user) return null;

      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, input.userId))
        .orderBy(desc(orders.createdAt));

      const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total), 0);

      return {
        ...user,
        orders: userOrders,
        totalOrders: userOrders.length,
        totalSpent,
      };
    }),

  getCustomerSegments: adminQuery.query(async () => {
    if (!env.databaseUrl) {
      return demoSegments;
    }

    const db = getDb();
    const segments = await db
      .select()
      .from(customerSegments)
      .orderBy(asc(customerSegments.name));

    const counts = await db
      .select({
        segmentId: customerSegmentMembers.segmentId,
        count: sql<number>`count(*)`,
      })
      .from(customerSegmentMembers)
      .groupBy(customerSegmentMembers.segmentId);

    const countMap = new Map(counts.map((c) => [c.segmentId, c.count]));

    return segments.map((s) => ({
      ...s,
      criteria: s.criteria as Record<string, unknown>,
      memberCount: countMap.get(s.id) ?? 0,
    }));
  }),

  createSegment: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        criteria: z.record(z.string(), z.unknown()),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!env.databaseUrl) {
        return { id: Date.now(), ...input };
      }

      const db = getDb();
      const [segment] = await db.insert(customerSegments).values({
        name: input.name,
        description: input.description ?? null,
        criteria: input.criteria,
        color: input.color ?? "#6B3A3A",
      });
      return { id: Number(segment.insertId) };
    }),

  getCustomerAnalytics: adminQuery
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
      }).optional()
    )
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const days = input?.period === "7d" ? 7 : input?.period === "90d" ? 90 : 30;
        const since = Date.now() - days * 24 * 60 * 60 * 1000;
        const periodOrders = demoOrders.filter(
          (order) => order.createdAt.getTime() >= since,
        );
        const repeatCustomerCount = demoCustomers.filter(
          (customer) => customer.totalOrders > 1,
        ).length;

        return {
          newCustomers: demoCustomers.filter(
            (customer) => customer.createdAt.getTime() >= since,
          ).length,
          totalCustomers: demoCustomers.length,
          revenue: periodOrders.reduce((sum, order) => sum + Number(order.total), 0),
          totalOrders: periodOrders.length,
          repeatCustomerCount,
          repeatRate:
            demoCustomers.length > 0
              ? ((repeatCustomerCount / demoCustomers.length) * 100).toFixed(1)
              : "0",
        };
      }

      const db = getDb();
      const days = input?.period === "7d" ? 7 : input?.period === "90d" ? 90 : 30;
      const sinceTimestamp = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const newCustomers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`${users.createdAt} >= ${sinceTimestamp}`);

      const totalCustomers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      const revenue = await db
        .select({
          total: sql<string>`COALESCE(sum(${orders.total}), 0)`,
          count: sql<number>`count(*)`,
        })
        .from(orders)
        .where(sql`${orders.createdAt} >= ${sinceTimestamp}`);

      const repeatCustomers = await db
        .select({
          userId: orders.userId,
          orderCount: sql<number>`count(*)`,
        })
        .from(orders)
        .groupBy(orders.userId)
        .having(sql`count(*) > 1`);

      return {
        newCustomers: newCustomers[0]?.count ?? 0,
        totalCustomers: totalCustomers[0]?.count ?? 0,
        revenue: Number(revenue[0]?.total ?? 0),
        totalOrders: revenue[0]?.count ?? 0,
        repeatCustomerCount: repeatCustomers.length,
        repeatRate:
          totalCustomers[0]?.count > 0
            ? ((repeatCustomers.length / totalCustomers[0].count) * 100).toFixed(1)
            : "0",
      };
    }),

  getAbandonedCarts: adminQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const page = input?.page ?? 1;
        return {
          items: [],
          total: 0,
          page,
          totalPages: 0,
        };
      }

      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const items = await db
        .select()
        .from(abandonedCarts)
        .orderBy(desc(abandonedCarts.abandonedAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(abandonedCarts);

      return {
        items: items.map((item) => ({
          ...item,
          cartItems: item.cartItems as Array<Record<string, unknown>>,
        })),
        total: countResult[0]?.count ?? 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
      };
    }),

  getRemarketingCampaigns: adminQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const page = input?.page ?? 1;
        const limit = input?.limit ?? 20;
        const offset = (page - 1) * limit;
        return {
          items: demoCampaigns.slice(offset, offset + limit),
          total: demoCampaigns.length,
          page,
          totalPages: Math.ceil(demoCampaigns.length / limit),
        };
      }

      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const items = await db
        .select()
        .from(remarketingCampaigns)
        .orderBy(desc(remarketingCampaigns.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(remarketingCampaigns);

      return {
        items,
        total: countResult[0]?.count ?? 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
      };
    }),

  createCampaign: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        segmentId: z.number().optional(),
        type: z.enum(["email", "sms", "push", "whatsapp"]).default("email"),
        subject: z.string().optional(),
        content: z.string().optional(),
        scheduledAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!env.databaseUrl) {
        return { id: Date.now(), ...input };
      }

      const db = getDb();
      const [campaign] = await db.insert(remarketingCampaigns).values({
        name: input.name,
        segmentId: input.segmentId ?? null,
        type: input.type,
        subject: input.subject ?? null,
        content: input.content ?? null,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      });
      return { id: Number(campaign.insertId) };
    }),

  updateCampaign: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        segmentId: z.number().optional(),
        type: z.enum(["email", "sms", "push", "whatsapp"]).optional(),
        subject: z.string().optional(),
        content: z.string().optional(),
        scheduledAt: z.string().optional(),
        status: z.enum(["draft", "scheduled", "sending", "sent", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!env.databaseUrl) {
        return { success: true, id: input.id };
      }

      const db = getDb();
      const { id: _id, ...rawUpdates } = input;
      
      const updateData: Record<string, unknown> = {};
      if (rawUpdates.name !== undefined) updateData.name = rawUpdates.name;
      if (rawUpdates.segmentId !== undefined) updateData.segmentId = rawUpdates.segmentId ?? null;
      if (rawUpdates.type !== undefined) updateData.type = rawUpdates.type;
      if (rawUpdates.subject !== undefined) updateData.subject = rawUpdates.subject ?? null;
      if (rawUpdates.content !== undefined) updateData.content = rawUpdates.content ?? null;
      if (rawUpdates.status !== undefined) updateData.status = rawUpdates.status;
      if (rawUpdates.scheduledAt !== undefined) {
        updateData.scheduledAt = rawUpdates.scheduledAt ? new Date(rawUpdates.scheduledAt) : null;
      }
      
      await db
        .update(remarketingCampaigns)
        .set(updateData as Record<string, unknown>)
        .where(eq(remarketingCampaigns.id, _id));
      return { success: true };
    }),

  sendCampaign: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      if (!env.databaseUrl) {
        return { success: true, id: input.id };
      }

      const db = getDb();
      await db
        .update(remarketingCampaigns)
        .set({
          status: "sent",
          sentAt: new Date(),
        })
        .where(eq(remarketingCampaigns.id, input.id));
      return { success: true };
    }),

  getDashboardStats: adminQuery.query(async () => {
    if (!env.databaseUrl) {
      return {
        totalCustomers: demoCustomers.length,
        totalOrders: demoOrders.length,
        totalRevenue: demoOrders.reduce((sum, order) => sum + Number(order.total), 0),
        activeCampaigns: demoCampaigns.filter((campaign) =>
          ["scheduled", "sending"].includes(campaign.status),
        ).length,
        abandonedCarts: 2,
      };
    }

    const db = getDb();

    const totalCustomers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    const totalRevenue = await db
      .select({ total: sql<string>`COALESCE(sum(${orders.total}), 0)` })
      .from(orders);

    const activeCampaigns = await db
      .select({ count: sql<number>`count(*)` })
      .from(remarketingCampaigns)
      .where(sql`${remarketingCampaigns.status} IN ('scheduled', 'sending')`);

    const abandonedCartCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(abandonedCarts)
      .where(sql`${abandonedCarts.recovered} = false`);

    return {
      totalCustomers: totalCustomers[0]?.count ?? 0,
      totalOrders: totalOrders[0]?.count ?? 0,
      totalRevenue: Number(totalRevenue[0]?.total ?? 0),
      activeCampaigns: activeCampaigns[0]?.count ?? 0,
      abandonedCarts: abandonedCartCount[0]?.count ?? 0,
    };
  }),
});
