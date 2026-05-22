# BakeRush Cake Delivery Website

## Project Rule

Update this file after every meaningful module change.

Keep notes short, practical, and current so the project does not become confusing later.

## Current Stack

- Frontend: React, TypeScript, Vite, Tailwind, shadcn-style UI components
- Backend: Hono, tRPC
- Data layer: Drizzle/MySQL schema present
- Local mode: Demo backend fallback is active when `DATABASE_URL` is missing
- Hosting mode: Render blueprint is available for one-service frontend + backend deploy
- Dev URL: `http://127.0.0.1:5173/`

## Core Storefront Modules

- Homepage hero:
  - Scroll-driven 3-scene hero
  - Admin-editable text, image, price, badges, accent color, background gradient
  - Route: `/admin/hero`

- Product listing/search:
  - Route: `/shop`
  - URL-aware search params: `search`, `category`, `collection`, `occasion`, `sort`
  - Robust demo search across product name, slug, description, category and tags
  - Active filter chips and popular searches added

- Product detail:
  - Route: `/shop/:slug`
  - Gallery images
  - Weight selector
  - Cake message field
  - Delivery pincode check
  - Backend-driven add-ons

- Cart and checkout:
  - Cart preserves weight, cake message and selected add-ons
  - Checkout passes selected size and add-ons into order item name
  - Checkout is now a 4-step flow: login, delivery address, delivery date/time, review order
  - Login is mandatory before checkout and now opens as a cart-page login/signup popup from `Proceed to Checkout`
  - Login details now collect customer name, mobile number and optional email
  - Mobile OTP test gateway uses OTP `123456`
  - Google sign-in UI is present in demo mode; real Google OAuth credentials are needed before production
  - Product-page delivery pincode can prefill and lock checkout area, city and pincode
  - Review order shows message-on-cake lines from product/cart items

## Admin Modules

- Dashboard: `/admin`
- Hero editor: `/admin/hero`
- Collections: `/admin/collections`
- Orders: `/admin/orders`
- Products: `/admin/products`
- Add-ons: `/admin/add-ons`
- Locations: `/admin/locations`
- Occasions: `/admin/occasions`
- Customers: `/admin/customers`
- Segments: `/admin/segments`
- Campaigns: `/admin/campaigns`
- Desktop/tablet admin navigation is a left sidebar; horizontal tabs are only for small mobile widths

## Product Management

- Product CRUD
- Bulk product upload through CSV template, CSV file upload/paste, validation preview and batch import
- SKU field for product inventory/order tracking
- Main image upload
- Gallery image upload
- Image previews
- Stock, tags, category, price, compare price
- Bestseller/new flags
- Product images are saved under `public/uploads/products`
- Bulk CSV supports category mapping by category slug/name/id, image URLs, gallery URLs, tags, stock and bestseller/new flags

## Collection Hierarchy

Collection hierarchy now supports:

- Main collection: example `Cakes`, `Theme Cakes`, `Birthday`
- Sub collection/menu column: example `By Flavours`, `By Type`, `Kids Cakes`
- Collection item: example `Chocolate Cakes`, `Eggless Cakes`
- Storefront path
- Badge
- Promo image
- Active status
- Sort order
- Optional linked occasion slug

Important:

- Collection hierarchy is now linked to occasions through `occasionSlug`.
- Example: Birthday menu items can link to `birthday-special`.
- The `/shop` page can filter by both `collection` and `occasion`.

## Add-ons Markup

Add-ons are now backend-driven:

- Admin route: `/admin/add-ons`
- Add-on fields: name, slug, description, price, image, type, active, sort order
- Add-ons can be global or restricted by product slugs
- Product detail page reads add-ons from `trpc.commerce.listAddOns`

## Occasion Management

- Admin route: `/admin/occasions`
- Supports occasion/festival/category/recipient sections
- Product slugs can be attached to event-wise sections
- Used for FNP-style event and festival storefront planning

## Location Management

- Admin route: `/admin/locations`
- Pincode, city, area
- Multiple active areas can map to one pincode; example `226017` supports Rajaji Puram and Alam Nagar in Lucknow
- Same-day flag
- Express minutes
- Midnight delivery flag
- Delivery fee
- Active status

## Backend Notes

Currently implemented in demo-memory mode:

- User management
- Products
- Locations
- Occasions
- Collections
- Add-ons
- Hero slides
- CRM demo data
- Hosted preview can run with `DEMO_MODE=true`

Production persistence still needed:

- DB tables/migrations for hero slides
- DB tables/migrations for collection hierarchy
- DB tables/migrations for add-ons
- Proper file/object storage for production image uploads

## Hosting

- Render blueprint: `render.yaml`
- Hosting guide: `HOSTING.md`
- Health check: `/api/health`
- Production env sample: `.env.production.example`
- Current recommended first deploy: Render free web service in demo mode

## Reference Sites

- Bakingo: cake product detail, message-on-cake, weight selector, delivery pincode, cake-focused mega menu.
- FNP: occasion-wise collection pages, gifting mega menu, event/festival sections.
- IGP: robust gifting search, delivery speed badges, personalizable flags, cake+flower combos, add-on upsells.

Current scope note:

- International delivery is not in scope right now.
- Build for India/local city delivery first.

## Latest Change Log

### 2026-05-16

- Added admin side module menu.
- Added product image upload and gallery support.
- Added product detail add-ons UI.
- Added backend-driven add-ons module.
- Added collection hierarchy module.
- Connected collection items to optional `occasionSlug`.
- Made shop search URL-aware and collection/occasion-aware.
- Created this project documentation file.
- Added product SKU field across schema, demo products, admin product form/table, product detail, cart and checkout payload.
- Reviewed IGP.com reference. Adopt local delivery/search/combo/personalization ideas only; international gifting is out of scope for now.
- Rebuilt checkout into a Bakingo-style 4-step flow with mandatory login, Google sign-in UI, mobile OTP test flow, receiver name, address, slot selection and review order.
- Updated checkout login to capture customer name/email/mobile instead of generic Mobile Customer.
- Hooked product-page delivery pincode into checkout address lock and review order message-on-cake display.
- Added checkout migration so old demo users named `Mobile Customer` or `Google Customer` are cleared and must enter a real customer name.
- Cleaned checkout login UI so the mobile number is captured once and OTP is sent to the same number.
- Moved login/signup UX to the cart `Proceed to Checkout` modal so checkout starts directly with delivery address after login.
- Added admin bulk product upload with CSV template, preview validation and backend batch create.
- Fixed admin navigation breakpoint so the module menu stays on the left side in desktop/tablet browser widths.
- Added Render hosting blueprint, hosted demo mode, production env sample and `/api/health`.
- Made `npm run start` hosting-friendly; production mode is supplied through host environment variables.
- Updated Render demo auth placeholders so Blueprint deploy does not depend on empty auth values.
- Moved Vite/esbuild/Tailwind build tooling into deploy dependencies so Render free web service can build even when production install skips dev dependencies.
- Added backend user management with admin list/search/filter, create, edit, role/status/provider/notes controls, delete protection for admin accounts and `/admin/users` UI.
