import { authRouter } from "./auth-router";
import { productRouter } from "./routers/product";
import { cartRouter } from "./routers/cart";
import { orderRouter } from "./routers/order";
import { crmRouter } from "./routers/crm";
import { adminRouter } from "./routers/admin";
import { commerceRouter } from "./routers/commerce";
import { siteRouter } from "./routers/site";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
  crm: crmRouter,
  admin: adminRouter,
  commerce: commerceRouter,
  site: siteRouter,
});

export type AppRouter = typeof appRouter;
