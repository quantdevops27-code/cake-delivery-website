import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  decimal,
  boolean,
  json,
  date,
} from "drizzle-orm/mysql-core";

// ─── Users ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin", "manager", "supervisor"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "blocked"]).default("active").notNull(),
  authProvider: mysqlEnum("authProvider", ["mobile", "google", "email", "demo"]).default("mobile").notNull(),
  permissions: json("permissions"),
  notes: text("notes"),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Categories ───
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  image: text("image"),
  description: text("description"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// ─── Products ───
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 80 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  image: text("image").notNull(),
  images: json("images"),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }),
  tags: json("tags"),
  weightKg: decimal("weightKg", { precision: 5, scale: 2 }),
  servings: int("servings"),
  isBestseller: boolean("isBestseller").default(false),
  isNew: boolean("isNew").default(false),
  stockQuantity: int("stockQuantity").default(100),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  reviewCount: int("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;

// ─── Cart Items ───
export const cartItems = mysqlTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull().default(1),
  message: varchar("message", { length: 500 }),
  deliveryDate: date("deliveryDate"),
  deliveryTime: mysqlEnum("deliveryTime", [
    "standard",
    "midnight",
    "fixed",
    "morning",
  ]).default("standard"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;

// ─── Orders ───
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "baking",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]).default("pending"),
  paymentStatus: mysqlEnum("paymentStatus", [
    "pending",
    "paid",
    "failed",
    "refunded",
  ]).default("pending"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default(
    "0"
  ),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  deliveryName: varchar("deliveryName", { length: 255 }),
  deliveryPhone: varchar("deliveryPhone", { length: 20 }),
  deliveryAddress: text("deliveryAddress"),
  deliveryCity: varchar("deliveryCity", { length: 100 }),
  deliveryPincode: varchar("deliveryPincode", { length: 10 }),
  deliveryDate: date("deliveryDate"),
  deliveryTime: varchar("deliveryTime", { length: 50 }),
  specialInstructions: text("specialInstructions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

// ─── Order Items ───
export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productSku: varchar("productSku", { length: 80 }),
  productImage: text("productImage"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  message: varchar("message", { length: 500 }),
});

export type OrderItem = typeof orderItems.$inferSelect;

// ─── Reviews ───
export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;

// ─── Customer Segments (CRM) ───
export const customerSegments = mysqlTable("customer_segments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  criteria: json("criteria"),
  color: varchar("color", { length: 7 }).default("#6B3A3A"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerSegment = typeof customerSegments.$inferSelect;

// ─── Customer Segment Members (CRM) ───
export const customerSegmentMembers = mysqlTable(
  "customer_segment_members",
  {
    id: serial("id").primaryKey(),
    segmentId: bigint("segmentId", { mode: "number", unsigned: true }).notNull(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    addedAt: timestamp("addedAt").defaultNow().notNull(),
  }
);

// ─── Remarketing Campaigns (CRM) ───
export const remarketingCampaigns = mysqlTable("remarketing_campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  segmentId: bigint("segmentId", { mode: "number", unsigned: true }),
  type: mysqlEnum("type", ["email", "sms", "push", "whatsapp"]).default(
    "email"
  ),
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  status: mysqlEnum("status", [
    "draft",
    "scheduled",
    "sending",
    "sent",
    "cancelled",
  ]).default("draft"),
  openRate: decimal("openRate", { precision: 5, scale: 2 }).default("0"),
  clickRate: decimal("clickRate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RemarketingCampaign = typeof remarketingCampaigns.$inferSelect;

// ─── Abandoned Carts (CRM) ───
export const abandonedCarts = mysqlTable("abandoned_carts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  cartItems: json("cartItems"),
  totalValue: decimal("totalValue", { precision: 10, scale: 2 }).notNull(),
  reminderSent: boolean("reminderSent").default(false),
  recovered: boolean("recovered").default(false),
  abandonedAt: timestamp("abandonedAt").defaultNow().notNull(),
  recoveredAt: timestamp("recoveredAt"),
});

export type AbandonedCart = typeof abandonedCarts.$inferSelect;
