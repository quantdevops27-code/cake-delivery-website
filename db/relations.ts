import { relations } from "drizzle-orm";
import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  reviews,
  customerSegments,
  customerSegmentMembers,
  remarketingCampaigns,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  orders: many(orders),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const customerSegmentsRelations = relations(customerSegments, ({ many }) => ({
  members: many(customerSegmentMembers),
  campaigns: many(remarketingCampaigns),
}));

export const customerSegmentMembersRelations = relations(customerSegmentMembers, ({ one }) => ({
  segment: one(customerSegments, {
    fields: [customerSegmentMembers.segmentId],
    references: [customerSegments.id],
  }),
  user: one(users, {
    fields: [customerSegmentMembers.userId],
    references: [users.id],
  }),
}));
