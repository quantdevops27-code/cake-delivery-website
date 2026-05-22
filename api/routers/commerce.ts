import { z } from "zod";
import { createRouter, moduleQuery, publicQuery } from "../middleware";
import {
  demoLocations,
  demoAddOns,
  demoCollectionItems,
  demoOccasionSections,
  demoProducts,
} from "../demo-data";

const locationInput = z.object({
  city: z.string().min(1),
  pincode: z.string().min(4),
  area: z.string().min(1),
  sameDay: z.boolean().default(true),
  expressMinutes: z.number().min(0).default(120),
  midnightDelivery: z.boolean().default(false),
  deliveryFee: z.string().default("0.00"),
  isActive: z.boolean().default(true),
});

const occasionSectionInput = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["occasion", "festival", "category", "recipient"]),
  event: z.string().min(1),
  image: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  productSlugs: z.array(z.string()).default([]),
});

const collectionItemInput = z.object({
  navName: z.string().min(1),
  navPath: z.string().min(1),
  columnTitle: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  path: z.string().min(1),
  badge: z.string().nullable().optional(),
  promoImage: z.string().nullable().optional(),
  occasionSlug: z.string().nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const addOnInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.string().min(1),
  image: z.string().min(1),
  type: z.enum(["topper", "candle", "flower", "dessert", "gift", "custom"]),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
  productSlugs: z.array(z.string()).default([]),
});

function buildCollectionMenus(items = demoCollectionItems) {
  const navMap = new Map<string, {
    name: string;
    path: string;
    promoImage: string | null;
    columns: Array<{
      title: string;
      items: Array<{
        id: number;
        name: string;
        slug: string;
        path: string;
        badge: string | null;
        occasionSlug: string | null;
      }>;
    }>;
  }>();

  items
    .filter((item) => item.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((item) => {
      const nav = navMap.get(item.navName) ?? {
        name: item.navName,
        path: item.navPath,
        promoImage: item.promoImage,
        columns: [],
      };
      if (!nav.promoImage && item.promoImage) nav.promoImage = item.promoImage;
      const column =
        nav.columns.find((entry) => entry.title === item.columnTitle) ??
        { title: item.columnTitle, items: [] };
      if (!nav.columns.includes(column)) nav.columns.push(column);
      column.items.push({
        id: item.id,
        name: item.name,
        slug: item.slug,
        path: item.path,
        badge: item.badge ?? null,
        occasionSlug: item.occasionSlug ?? null,
      });
      navMap.set(item.navName, nav);
    });

  return Array.from(navMap.values());
}

export const commerceRouter = createRouter({
  listCollectionMenus: publicQuery.query(() => buildCollectionMenus()),

  adminListCollectionItems: moduleQuery("collections").query(() =>
    [...demoCollectionItems].sort((a, b) => a.navName.localeCompare(b.navName) || a.sortOrder - b.sortOrder),
  ),

  createCollectionItem: moduleQuery("collections").input(collectionItemInput).mutation(({ input }) => {
    const item = {
      id: Math.max(...demoCollectionItems.map((entry) => entry.id), 0) + 1,
      ...input,
      badge: input.badge ?? null,
      promoImage: input.promoImage ?? null,
      occasionSlug: input.occasionSlug ?? null,
    };
    demoCollectionItems.push(item);
    return item;
  }),

  updateCollectionItem: moduleQuery("collections")
    .input(collectionItemInput.extend({ id: z.number() }))
    .mutation(({ input }) => {
      const index = demoCollectionItems.findIndex((item) => item.id === input.id);
      if (index === -1) return { success: false };
      demoCollectionItems[index] = {
        ...input,
        badge: input.badge ?? null,
        promoImage: input.promoImage ?? null,
        occasionSlug: input.occasionSlug ?? null,
      };
      return { success: true };
    }),

  deleteCollectionItem: moduleQuery("collections")
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      const index = demoCollectionItems.findIndex((item) => item.id === input.id);
      if (index >= 0) demoCollectionItems.splice(index, 1);
      return { success: true };
    }),

  listAddOns: publicQuery
    .input(z.object({ productSlug: z.string().optional() }).optional())
    .query(({ input }) =>
      [...demoAddOns]
        .filter((addOn) => addOn.active)
        .filter((addOn) => !input?.productSlug || addOn.productSlugs.length === 0 || addOn.productSlugs.includes(input.productSlug))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ),

  adminListAddOns: moduleQuery("addons").query(() =>
    [...demoAddOns].sort((a, b) => a.sortOrder - b.sortOrder),
  ),

  createAddOn: moduleQuery("addons").input(addOnInput).mutation(({ input }) => {
    const addOn = {
      id: Math.max(...demoAddOns.map((entry) => entry.id), 0) + 1,
      ...input,
      description: input.description ?? "",
    };
    demoAddOns.push(addOn);
    return addOn;
  }),

  updateAddOn: moduleQuery("addons")
    .input(addOnInput.extend({ id: z.number() }))
    .mutation(({ input }) => {
      const index = demoAddOns.findIndex((item) => item.id === input.id);
      if (index === -1) return { success: false };
      demoAddOns[index] = {
        ...input,
        description: input.description ?? "",
      };
      return { success: true };
    }),

  deleteAddOn: moduleQuery("addons").input(z.object({ id: z.number() })).mutation(({ input }) => {
    const index = demoAddOns.findIndex((item) => item.id === input.id);
    if (index >= 0) demoAddOns.splice(index, 1);
    return { success: true };
  }),

  validatePincode: publicQuery
    .input(z.object({ pincode: z.string() }))
    .query(({ input }) => {
      const locations = demoLocations.filter(
        (item) => item.pincode === input.pincode && item.isActive,
      );
      const location = locations[0] ?? null;
      return {
        serviceable: locations.length > 0,
        location,
        locations,
      };
    }),

  listLocations: moduleQuery("locations").query(() =>
    [...demoLocations].sort((a, b) => a.city.localeCompare(b.city)),
  ),

  createLocation: moduleQuery("locations").input(locationInput).mutation(({ input }) => {
    const location = {
      id: Math.max(...demoLocations.map((item) => item.id), 0) + 1,
      ...input,
    };
    demoLocations.unshift(location);
    return location;
  }),

  updateLocation: moduleQuery("locations")
    .input(locationInput.extend({ id: z.number() }))
    .mutation(({ input }) => {
      const index = demoLocations.findIndex((item) => item.id === input.id);
      if (index === -1) return { success: false };
      demoLocations[index] = input;
      return { success: true };
    }),

  deleteLocation: moduleQuery("locations")
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      const index = demoLocations.findIndex((item) => item.id === input.id);
      if (index >= 0) demoLocations.splice(index, 1);
      return { success: true };
    }),

  listOccasionSections: publicQuery.query(() =>
    [...demoOccasionSections]
      .filter((section) => section.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((section) => ({
        ...section,
        products: section.productSlugs
          .map((slug) => demoProducts.find((product) => product.slug === slug))
          .filter(Boolean),
      })),
  ),

  adminListOccasionSections: moduleQuery("occasions").query(() =>
    [...demoOccasionSections].sort((a, b) => a.sortOrder - b.sortOrder),
  ),

  createOccasionSection: moduleQuery("occasions")
    .input(occasionSectionInput)
    .mutation(({ input }) => {
      const section = {
        id: Math.max(...demoOccasionSections.map((item) => item.id), 0) + 1,
        ...input,
        description: input.description ?? "",
        startsAt: input.startsAt ?? null,
        endsAt: input.endsAt ?? null,
      };
      demoOccasionSections.push(section);
      return section;
    }),

  updateOccasionSection: moduleQuery("occasions")
    .input(occasionSectionInput.extend({ id: z.number() }))
    .mutation(({ input }) => {
      const index = demoOccasionSections.findIndex((item) => item.id === input.id);
      if (index === -1) return { success: false };
      demoOccasionSections[index] = {
        ...input,
        description: input.description ?? "",
        startsAt: input.startsAt ?? null,
        endsAt: input.endsAt ?? null,
      };
      return { success: true };
    }),

  deleteOccasionSection: moduleQuery("occasions")
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      const index = demoOccasionSections.findIndex((item) => item.id === input.id);
      if (index >= 0) demoOccasionSections.splice(index, 1);
      return { success: true };
    }),
});
