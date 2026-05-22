import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { env } from "../lib/env";
import { demoOrders } from "../demo-data";
import { orders } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const adminRouter = createRouter({
  getOrders: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const page = input?.page ?? 1;
        const limit = input?.limit ?? 20;
        const filtered = input?.status
          ? demoOrders.filter((order) => order.status === input.status)
          : demoOrders;
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

      let whereClause;
      if (input?.status) {
        whereClause = sql`${orders.status} = ${input.status}`;
      }

      const items = await db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereClause);

      return {
        items,
        total: countResult[0]?.count ?? 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
      };
    }),

  updateOrderStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "pending",
          "confirmed",
          "baking",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      if (!env.databaseUrl) {
        return { success: true, id: input.id, status: input.status };
      }

      const db = getDb();
      await db
        .update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.id));
      return { success: true };
    }),

  getStats: adminQuery.query(async () => {
    if (!env.databaseUrl) {
      const totalRevenue = demoOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      );
      const statusBreakdown = Object.entries(
        demoOrders.reduce<Record<string, number>>((acc, order) => {
          acc[order.status] = (acc[order.status] ?? 0) + 1;
          return acc;
        }, {}),
      ).map(([status, count]) => ({ status, count }));

      return {
        totalOrders: demoOrders.length,
        totalRevenue,
        statusBreakdown,
        recentOrders: demoOrders.slice(0, 5),
      };
    }

    const db = getDb();

    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    const totalRevenue = await db
      .select({ total: sql<string>`COALESCE(sum(${orders.total}), 0)` })
      .from(orders);

    const statusCounts = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .groupBy(orders.status);

    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    return {
      totalOrders: totalOrders[0]?.count ?? 0,
      totalRevenue: Number(totalRevenue[0]?.total ?? 0),
      statusBreakdown: statusCounts,
      recentOrders,
    };
  }),
});
