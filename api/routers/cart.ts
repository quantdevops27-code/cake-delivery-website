import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { cartItems, products } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const cartRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        message: cartItems.message,
        deliveryDate: cartItems.deliveryDate,
        deliveryTime: cartItems.deliveryTime,
        productId: cartItems.productId,
        productName: products.name,
        productPrice: products.price,
        productImage: products.image,
        productSlug: products.slug,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    const total = items.reduce(
      (sum, item) => sum + Number(item.productPrice) * item.quantity,
      0
    );

    return { items, total };
  }),

  add: authedQuery
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
        message: z.string().max(500).optional(),
        deliveryDate: z.string().optional(),
        deliveryTime: z.enum(["standard", "midnight", "fixed", "morning"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check if product exists
      const product = await db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      // Check if already in cart
      const existing = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, input.productId)
        ),
      });

      if (existing) {
        // Update quantity
        await db
          .update(cartItems)
          .set({ quantity: existing.quantity + input.quantity })
          .where(eq(cartItems.id, existing.id));

        return { success: true, updated: true };
      }

      // Add new item
      await db.insert(cartItems).values({
        userId,
        productId: input.productId,
        quantity: input.quantity,
        message: input.message ?? null,
        deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
        deliveryTime: input.deliveryTime ?? "standard",
      });

      return { success: true, updated: false };
    }),

  update: authedQuery
    .input(
      z.object({
        itemId: z.number(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const item = await db.query.cartItems.findFirst({
        where: and(eq(cartItems.id, input.itemId), eq(cartItems.userId, userId)),
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });
      }

      await db
        .update(cartItems)
        .set({ quantity: input.quantity })
        .where(eq(cartItems.id, input.itemId));

      return { success: true };
    }),

  remove: authedQuery
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      await db
        .delete(cartItems)
        .where(and(eq(cartItems.id, input.itemId), eq(cartItems.userId, userId)));

      return { success: true };
    }),

  clear: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.delete(cartItems).where(eq(cartItems.userId, ctx.user.id));
    return { success: true };
  }),
});
