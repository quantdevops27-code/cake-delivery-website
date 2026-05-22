import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { TRPCError } from "@trpc/server";
import { createRouter, moduleQuery, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { env } from "../lib/env";
import { demoCategories, demoCollectionItems, demoOccasionSections, demoProducts } from "../demo-data";
import { products, categories } from "@db/schema";
import { eq, like, desc, asc, and, or, sql } from "drizzle-orm";

const listInput = z.object({
  categorySlug: z.string().optional(),
  collectionSlug: z.string().optional(),
  occasionSlug: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "bestsellers"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

const productAdminInput = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.string().min(1),
  compareAtPrice: z.string().optional().nullable(),
  image: z.string().min(1),
  images: z.array(z.string()).default([]),
  categoryId: z.number().optional().nullable(),
  tags: z.array(z.string()).default([]),
  weightKg: z.string().optional().nullable(),
  servings: z.number().optional().nullable(),
  stockQuantity: z.number().optional(),
  isBestseller: z.boolean().default(false),
  isNew: z.boolean().default(false),
});

const bulkProductAdminInput = z.object({
  products: z.array(productAdminInput).min(1).max(500),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function skuify(value: string, id?: number) {
  const base =
    value
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "PRODUCT";
  return `BR-${base}${id ? `-${id}` : ""}`;
}

function getImageExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return null;
  }
}

const searchStopWords = new Set([
  "cake",
  "cakes",
  "gift",
  "gifts",
  "for",
  "to",
  "by",
  "and",
  "online",
  "delivery",
]);

function normalizeSearchTerms(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((term) => term.trim())
    .filter((term) => term.length > 1 && !searchStopWords.has(term));
}

function searchableProductText(product: (typeof demoProducts)[number]) {
  const category = demoCategories.find((item) => item.id === product.categoryId);
  return [
    product.name,
    product.sku,
    product.slug,
    product.shortDescription,
    product.description,
    category?.name,
    category?.slug,
    ...product.tags,
  ].join(" ").toLowerCase();
}

function matchesSearch(product: (typeof demoProducts)[number], search?: string) {
  if (!search) return true;
  const terms = normalizeSearchTerms(search);
  if (terms.length === 0) return true;
  const text = searchableProductText(product);
  return terms.every((term) => text.includes(term));
}

function collectionSearchValue(collectionSlug?: string) {
  if (!collectionSlug) return "";
  const collection = demoCollectionItems.find((item) => item.slug === collectionSlug);
  if (!collection) return collectionSlug;
  return [collection.name, collection.slug, collection.columnTitle, collection.navName].join(" ");
}

function filterDemoProducts(params: {
  categorySlug?: string;
  collectionSlug?: string;
  occasionSlug?: string;
  search?: string;
}) {
  const category = params.categorySlug
    ? demoCategories.find((cat) => cat.slug === params.categorySlug)
    : undefined;
  const occasion = params.occasionSlug
    ? demoOccasionSections.find((section) => section.slug === params.occasionSlug)
    : undefined;
  const collectionSearch = collectionSearchValue(params.collectionSlug);

  return demoProducts
    .filter((product) => !category || product.categoryId === category.id)
    .filter((product) => !occasion || occasion.productSlugs.length === 0 || occasion.productSlugs.includes(product.slug))
    .filter((product) => matchesSearch(product, params.search))
    .filter((product) => matchesSearch(product, collectionSearch));
}

export const productRouter = createRouter({
  uploadImage: moduleQuery("products")
    .input(
      z.object({
        fileName: z.string().min(1),
        dataUrl: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const match = input.dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,(.+)$/);
      if (!match) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only JPG, PNG, WEBP and GIF images are supported",
        });
      }

      const extension = getImageExtension(match[1]);
      if (!extension) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unsupported image type",
        });
      }

      const safeBaseName =
        input.fileName
          .replace(/\.[^.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 50) || "product";
      const fileName = `${Date.now()}-${safeBaseName}.${extension}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), Buffer.from(match[2], "base64"));

      return { url: `/uploads/products/${fileName}` };
    }),

  adminList: moduleQuery("products")
    .input(listInput.optional())
    .query(async ({ input }) => {
      const params = input ?? { page: 1, limit: 20 };
      const { categorySlug, collectionSlug, occasionSlug, search, sort, page = 1, limit = 20 } = params;

      if (!env.databaseUrl) {
        const filtered = filterDemoProducts({ categorySlug, collectionSlug, occasionSlug, search })
          .sort((a, b) => {
            switch (sort) {
              case "price_asc":
                return Number(a.price) - Number(b.price);
              case "price_desc":
                return Number(b.price) - Number(a.price);
              case "bestsellers":
                return b.reviewCount - a.reviewCount;
              default:
                return b.createdAt.getTime() - a.createdAt.getTime();
            }
          });

        const offset = (page - 1) * limit;
        return {
          items: filtered.slice(offset, offset + limit).map((product) => ({
            ...product,
            category:
              demoCategories.find((cat) => cat.id === product.categoryId) ?? null,
          })),
          total: filtered.length,
          page,
          totalPages: Math.ceil(filtered.length / limit),
        };
      }

      const db = getDb();
      const conditions = [];

      if (categorySlug) {
        const category = await db.query.categories.findFirst({
          where: eq(categories.slug, categorySlug),
        });
        if (category) conditions.push(eq(products.categoryId, category.id));
      }

      if (search) {
        conditions.push(
          or(
            like(products.name, `%${search}%`),
            like(products.sku, `%${search}%`),
            like(products.shortDescription, `%${search}%`),
            like(products.slug, `%${search.replace(/\s+/g, "-")}%`),
          ),
        );
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const offset = (page - 1) * limit;

      const orderBy =
        sort === "price_asc"
          ? asc(products.price)
          : sort === "price_desc"
            ? desc(products.price)
            : sort === "bestsellers"
              ? desc(products.reviewCount)
              : desc(products.createdAt);

      const items = await db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);

      return {
        items: items.map((item) => ({
          ...item,
          tags: (item.tags as string[]) ?? [],
          images: (item.images as string[]) ?? [],
        })),
        total: countResult[0]?.count ?? 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
      };
    }),

  create: moduleQuery("products").input(productAdminInput).mutation(async ({ input }) => {
    const slug = input.slug?.trim() || slugify(input.name);
    const sku = input.sku?.trim() || skuify(input.name);

    if (!env.databaseUrl) {
      const id = Math.max(...demoProducts.map((product) => product.id), 0) + 1;
      const product = {
        id,
        name: input.name,
        sku: input.sku?.trim() || skuify(input.name, id),
        slug,
        description: input.description ?? input.shortDescription ?? "",
        shortDescription: input.shortDescription ?? "",
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        image: input.image,
        images: input.images,
        categoryId: input.categoryId ?? 1,
        tags: input.tags,
        weightKg: input.weightKg ?? "0.5",
        servings: input.servings ?? 6,
        stockQuantity: input.stockQuantity ?? 100,
        isBestseller: input.isBestseller,
        isNew: input.isNew,
        rating: "4.8",
        reviewCount: 0,
        createdAt: new Date(),
      };
      demoProducts.unshift(product);
      return product;
    }

    const db = getDb();
    const [result] = await db.insert(products).values({
      name: input.name,
      sku,
      slug,
      description: input.description ?? null,
      shortDescription: input.shortDescription ?? null,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      image: input.image,
      images: input.images,
      categoryId: input.categoryId ?? null,
      tags: input.tags,
      weightKg: input.weightKg ?? null,
      servings: input.servings ?? null,
      stockQuantity: input.stockQuantity ?? 100,
      isBestseller: input.isBestseller,
      isNew: input.isNew,
    });
    return { id: Number(result.insertId), slug };
  }),

  bulkCreate: moduleQuery("products").input(bulkProductAdminInput).mutation(async ({ input }) => {
    const errors: Array<{ row: number; message: string }> = [];
    const created: Array<{ id?: number; sku: string; slug: string; name: string }> = [];

    if (!env.databaseUrl) {
      const existingSkus = new Set(demoProducts.map((product) => product.sku.toLowerCase()));
      const existingSlugs = new Set(demoProducts.map((product) => product.slug.toLowerCase()));
      const batchSkus = new Set<string>();
      const batchSlugs = new Set<string>();

      input.products.forEach((item, index) => {
        const row = index + 2;
        const id = Math.max(...demoProducts.map((product) => product.id), 0) + created.length + 1;
        const slug = item.slug?.trim() || slugify(item.name);
        const sku = item.sku?.trim() || skuify(item.name, id);
        const normalizedSku = sku.toLowerCase();
        const normalizedSlug = slug.toLowerCase();

        if (existingSkus.has(normalizedSku) || batchSkus.has(normalizedSku)) {
          errors.push({ row, message: `Duplicate SKU: ${sku}` });
          return;
        }
        if (existingSlugs.has(normalizedSlug) || batchSlugs.has(normalizedSlug)) {
          errors.push({ row, message: `Duplicate slug: ${slug}` });
          return;
        }

        demoProducts.unshift({
          id,
          name: item.name,
          sku,
          slug,
          description: item.description ?? item.shortDescription ?? "",
          shortDescription: item.shortDescription ?? "",
          price: item.price,
          compareAtPrice: item.compareAtPrice ?? null,
          image: item.image,
          images: item.images,
          categoryId: item.categoryId ?? 1,
          tags: item.tags,
          weightKg: item.weightKg ?? "0.5",
          servings: item.servings ?? 6,
          stockQuantity: item.stockQuantity ?? 100,
          isBestseller: item.isBestseller,
          isNew: item.isNew,
          rating: "4.8",
          reviewCount: 0,
          createdAt: new Date(),
        });
        batchSkus.add(normalizedSku);
        batchSlugs.add(normalizedSlug);
        created.push({ id, sku, slug, name: item.name });
      });

      return {
        createdCount: created.length,
        skippedCount: errors.length,
        created,
        errors,
      };
    }

    const db = getDb();
    const existingRows = await db
      .select({ sku: products.sku, slug: products.slug })
      .from(products);
    const existingSkus = new Set(existingRows.map((product) => product.sku.toLowerCase()));
    const existingSlugs = new Set(existingRows.map((product) => product.slug.toLowerCase()));
    const batchSkus = new Set<string>();
    const batchSlugs = new Set<string>();

    const values = input.products.flatMap((item, index) => {
      const row = index + 2;
      const slug = item.slug?.trim() || slugify(item.name);
      const sku = item.sku?.trim() || skuify(item.name);
      const normalizedSku = sku.toLowerCase();
      const normalizedSlug = slug.toLowerCase();

      if (existingSkus.has(normalizedSku) || batchSkus.has(normalizedSku)) {
        errors.push({ row, message: `Duplicate SKU: ${sku}` });
        return [];
      }
      if (existingSlugs.has(normalizedSlug) || batchSlugs.has(normalizedSlug)) {
        errors.push({ row, message: `Duplicate slug: ${slug}` });
        return [];
      }

      batchSkus.add(normalizedSku);
      batchSlugs.add(normalizedSlug);
      created.push({ sku, slug, name: item.name });
      return [{
        name: item.name,
        sku,
        slug,
        description: item.description ?? null,
        shortDescription: item.shortDescription ?? null,
        price: item.price,
        compareAtPrice: item.compareAtPrice ?? null,
        image: item.image,
        images: item.images,
        categoryId: item.categoryId ?? null,
        tags: item.tags,
        weightKg: item.weightKg ?? null,
        servings: item.servings ?? null,
        stockQuantity: item.stockQuantity ?? 100,
        isBestseller: item.isBestseller,
        isNew: item.isNew,
      }];
    });

    if (values.length > 0) {
      await db.insert(products).values(values);
    }

    return {
      createdCount: values.length,
      skippedCount: errors.length,
      created,
      errors,
    };
  }),

  update: moduleQuery("products")
    .input(productAdminInput.extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const slug = input.slug?.trim() || slugify(input.name);
      const sku = input.sku?.trim() || skuify(input.name, input.id);

      if (!env.databaseUrl) {
        const index = demoProducts.findIndex((product) => product.id === input.id);
        if (index === -1) return { success: false };
        demoProducts[index] = {
          ...demoProducts[index],
          name: input.name,
          sku,
          slug,
          description: input.description ?? input.shortDescription ?? "",
          shortDescription: input.shortDescription ?? "",
          price: input.price,
          compareAtPrice: input.compareAtPrice ?? null,
          image: input.image,
          images: input.images,
          categoryId: input.categoryId ?? 1,
          tags: input.tags,
          weightKg: input.weightKg ?? "0.5",
          servings: input.servings ?? 6,
          stockQuantity: input.stockQuantity ?? 100,
          isBestseller: input.isBestseller,
          isNew: input.isNew,
        };
        return { success: true };
      }

      const db = getDb();
      await db
        .update(products)
        .set({
          name: input.name,
          sku,
          slug,
          description: input.description ?? null,
          shortDescription: input.shortDescription ?? null,
          price: input.price,
          compareAtPrice: input.compareAtPrice ?? null,
          image: input.image,
          images: input.images,
          categoryId: input.categoryId ?? null,
          tags: input.tags,
          weightKg: input.weightKg ?? null,
          servings: input.servings ?? null,
          stockQuantity: input.stockQuantity ?? 100,
          isBestseller: input.isBestseller,
          isNew: input.isNew,
        })
        .where(eq(products.id, input.id));
      return { success: true };
    }),

  delete: moduleQuery("products").input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    if (!env.databaseUrl) {
      const index = demoProducts.findIndex((product) => product.id === input.id);
      if (index >= 0) demoProducts.splice(index, 1);
      return { success: true };
    }

    const db = getDb();
    await db.delete(products).where(eq(products.id, input.id));
    return { success: true };
  }),

  list: publicQuery
    .input(listInput.optional())
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const params = input ?? { page: 1, limit: 12 };
        const { categorySlug, collectionSlug, occasionSlug, search, sort, page = 1, limit = 12 } = params;

        const filtered = filterDemoProducts({ categorySlug, collectionSlug, occasionSlug, search })
          .sort((a, b) => {
            switch (sort) {
              case "price_asc":
                return Number(a.price) - Number(b.price);
              case "price_desc":
                return Number(b.price) - Number(a.price);
              case "bestsellers":
                return b.reviewCount - a.reviewCount;
              default:
                return b.createdAt.getTime() - a.createdAt.getTime();
            }
          });

        const offset = (page - 1) * limit;
        const items = filtered.slice(offset, offset + limit).map((product) => ({
          ...product,
          category:
            demoCategories.find((cat) => cat.id === product.categoryId) ?? null,
        }));

        return {
          items,
          total: filtered.length,
          page,
          totalPages: Math.ceil(filtered.length / limit),
        };
      }

      const db = getDb();
      const params = input ?? { page: 1, limit: 12 };
      const { categorySlug, search, sort, page = 1, limit = 12 } = params;

      const conditions = [];

      if (categorySlug) {
        const category = await db.query.categories.findFirst({
          where: eq(categories.slug, categorySlug),
        });
        if (category) {
          conditions.push(eq(products.categoryId, category.id));
        }
      }

      if (search) {
        conditions.push(
          or(
            like(products.name, `%${search}%`),
            like(products.sku, `%${search}%`),
            like(products.shortDescription, `%${search}%`),
            like(products.description, `%${search}%`),
            like(products.slug, `%${search.replace(/\s+/g, "-")}%`),
          ),
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      let orderBy;
      switch (sort) {
        case "price_asc":
          orderBy = asc(products.price);
          break;
        case "price_desc":
          orderBy = desc(products.price);
          break;
        case "bestsellers":
          orderBy = desc(products.reviewCount);
          break;
        default:
          orderBy = desc(products.createdAt);
      }

      const offset = (page - 1) * limit;

      const items = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          slug: products.slug,
          shortDescription: products.shortDescription,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          image: products.image,
          tags: products.tags,
          weightKg: products.weightKg,
          servings: products.servings,
          isBestseller: products.isBestseller,
          isNew: products.isNew,
          rating: products.rating,
          reviewCount: products.reviewCount,
          categoryId: products.categoryId,
        })
        .from(products)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);

      const total = countResult[0]?.count ?? 0;

      const categoryList = await db.select().from(categories);
      const categoryMap = new Map(categoryList.map((c) => [c.id, c]));

      const itemsWithCategory = items.map((item) => ({
        ...item,
        category: item.categoryId ? categoryMap.get(item.categoryId) ?? null : null,
        tags: (item.tags as string[]) ?? [],
      }));

      return {
        items: itemsWithCategory,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const product = demoProducts.find((item) => item.slug === input.slug);
        if (!product) return null;

        const related = demoProducts
          .filter(
            (item) =>
              item.categoryId === product.categoryId && item.id !== product.id,
          )
          .slice(0, 4);

        return {
          ...product,
          category:
            demoCategories.find((cat) => cat.id === product.categoryId) ?? null,
          related,
        };
      }

      const db = getDb();
      const product = await db.query.products.findFirst({
        where: eq(products.slug, input.slug),
        with: {
          category: true,
        },
      });

      if (!product) return null;

      const related = product.categoryId
        ? await db
            .select({
              id: products.id,
              name: products.name,
              sku: products.sku,
              slug: products.slug,
              image: products.image,
              price: products.price,
              rating: products.rating,
              reviewCount: products.reviewCount,
            })
            .from(products)
            .where(
              and(
                eq(products.categoryId, product.categoryId),
                sql`${products.id} != ${product.id}`
              )
            )
            .limit(4)
        : [];

      return {
        ...product,
        tags: (product.tags as string[]) ?? [],
        images: (product.images as string[]) ?? [],
        related,
      };
    }),

  getBestsellers: publicQuery
    .input(z.object({ limit: z.number().min(1).max(20).default(8) }).optional())
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const limit = input?.limit ?? 8;
        return [...demoProducts]
          .sort((a, b) => b.reviewCount - a.reviewCount)
          .slice(0, limit);
      }

      const db = getDb();
      const limit = input?.limit ?? 8;

      const items = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          slug: products.slug,
          shortDescription: products.shortDescription,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          image: products.image,
          rating: products.rating,
          reviewCount: products.reviewCount,
          isBestseller: products.isBestseller,
          isNew: products.isNew,
          categoryId: products.categoryId,
        })
        .from(products)
        .orderBy(desc(products.reviewCount))
        .limit(limit);

      return items;
    }),

  getCategories: publicQuery.query(async () => {
    if (!env.databaseUrl) {
      return demoCategories;
    }

    const db = getDb();
    const cats = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder));
    return cats;
  }),
});
