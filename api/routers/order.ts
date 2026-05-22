import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders, orderItems, cartItems } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateOrderNumber(): string {
  const prefix = "VW";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const orderRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
            price: z.number(),
            productName: z.string(),
            productSku: z.string().optional(),
            productImage: z.string().optional(),
            message: z.string().optional(),
          })
        ),
        deliveryDetails: z.object({
          name: z.string().min(1),
          phone: z.string().min(1),
          address: z.string().min(1),
          city: z.string().min(1),
          pincode: z.string().min(1),
          date: z.string().optional(),
          time: z.string().optional(),
          specialInstructions: z.string().optional(),
        }),
        deliveryFee: z.number().default(0),
        discount: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const subtotal = input.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const total = subtotal + input.deliveryFee - input.discount;

      const orderNumber = generateOrderNumber();

      const [order] = await db.insert(orders).values({
        userId,
        orderNumber,
        status: "pending",
        paymentStatus: "paid",
        subtotal: subtotal.toString(),
        deliveryFee: input.deliveryFee.toString(),
        discount: input.discount.toString(),
        total: total.toString(),
        deliveryName: input.deliveryDetails.name,
        deliveryPhone: input.deliveryDetails.phone,
        deliveryAddress: input.deliveryDetails.address,
        deliveryCity: input.deliveryDetails.city,
        deliveryPincode: input.deliveryDetails.pincode,
        deliveryDate: input.deliveryDetails.date
          ? new Date(input.deliveryDetails.date)
          : null,
        deliveryTime: input.deliveryDetails.time ?? "Standard Delivery",
        specialInstructions: input.deliveryDetails.specialInstructions ?? null,
      });

      const orderId = Number(order.insertId);

      for (const item of input.items) {
        await db.insert(orderItems).values({
          orderId,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku ?? null,
          productImage: item.productImage ?? null,
          price: item.price.toString(),
          quantity: item.quantity,
          message: item.message ?? null,
        });
      }

      await db.delete(cartItems).where(eq(cartItems.userId, userId));

      return { orderId, orderNumber };
    }),

  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, input.id), eq(orders.userId, ctx.user.id)),
        with: {
          orderItems: true,
        },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      return order;
    }),

  list: authedQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;
      const offset = (page - 1) * limit;

      const items = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, ctx.user.id))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(eq(orders.userId, ctx.user.id));

      return {
        items,
        total: countResult[0]?.count ?? 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
      };
    }),

  track: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({
        where: eq(orders.orderNumber, input.orderNumber),
        with: {
          orderItems: true,
        },
      });

      return order ?? null;
    }),
});
