import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Edit3,
  FileSpreadsheet,
  ImagePlus,
  PackagePlus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProductForm = {
  id?: number;
  name: string;
  sku: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  compareAtPrice: string;
  image: string;
  images: string[];
  categoryId: number;
  tags: string;
  weightKg: string;
  servings: number;
  stockQuantity: number;
  isBestseller: boolean;
  isNew: boolean;
};

type BulkProductPayload = Omit<ProductForm, "id" | "tags" | "compareAtPrice"> & {
  compareAtPrice: string | null;
  tags: string[];
};

type BulkPreviewRow = {
  rowNumber: number;
  raw: Record<string, string>;
  product?: BulkProductPayload;
  errors: string[];
};

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "599.00",
  compareAtPrice: "",
  image: "/images/cake-truffle.jpg",
  images: [],
  categoryId: 1,
  tags: "cake,birthday",
  weightKg: "0.5",
  servings: 6,
  stockQuantity: 100,
  isBestseller: false,
  isNew: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function skuify(value: string) {
  return `BR-${value
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24)}`;
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Image upload failed"));
    reader.readAsDataURL(file);
  });
}

function uniqueImages(images: string[]) {
  return Array.from(new Set(images.filter(Boolean)));
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function parseBoolean(value: string) {
  return ["1", "true", "yes", "y"].includes(value.trim().toLowerCase());
}

function splitPipeOrComma(value: string) {
  return value
    .split(value.includes("|") ? "|" : ",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const bulkTemplate = [
  "name,sku,slug,categorySlug,price,compareAtPrice,shortDescription,description,image,images,tags,weightKg,servings,stockQuantity,isBestseller,isNew",
  "\"Mango Cream Cake\",\"BR-CK-MANGO-0500\",\"mango-cream-cake\",\"gourmet\",\"649.00\",\"799.00\",\"Fresh mango cream cake\",\"Fresh mango layers with whipped cream\",\"/images/cake-truffle.jpg\",\"/images/cake-truffle.jpg|/images/cake-floral.jpg\",\"cake,mango,birthday\",\"0.5\",\"6\",\"80\",\"yes\",\"yes\"",
  "\"Chocolate Photo Cake\",\"BR-CK-PHOTO-1000\",\"chocolate-photo-cake\",\"designer\",\"1199.00\",\"1399.00\",\"Personalized chocolate cake\",\"Photo cake with rich chocolate finish\",\"/images/cake-velvet.jpg\",\"\",\"cake,photo,chocolate\",\"1\",\"10\",\"40\",\"no\",\"yes\"",
].join("\n");

export default function Products() {
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const utils = trpc.useUtils();
  const { data: categories } = trpc.product.getCategories.useQuery();
  const { data, isLoading } = trpc.product.adminList.useQuery({
    search: search || undefined,
    categorySlug: categorySlug === "all" ? undefined : categorySlug,
    page,
    limit: 20,
    sort: "newest",
  });

  const categoryById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category.name])),
    [categories],
  );
  const categoryLookup = useMemo(() => {
    const entries = categories ?? [];
    return new Map(
      entries.flatMap((category) => [
        [String(category.id).toLowerCase(), category.id],
        [category.slug.toLowerCase(), category.id],
        [category.name.toLowerCase(), category.id],
      ]),
    );
  }, [categories]);

  const bulkPreview = useMemo<BulkPreviewRow[]>(() => {
    if (!bulkText.trim()) return [];
    const rows = parseCsv(bulkText);
    if (rows.length < 2) return [];
    const headers = rows[0].map((header) => header.trim());

    return rows.slice(1).map((columns, index) => {
      const raw = Object.fromEntries(
        headers.map((header, headerIndex) => [header, columns[headerIndex]?.trim() ?? ""]),
      );
      const rowNumber = index + 2;
      const errors: string[] = [];
      const name = raw.name ?? "";
      const price = raw.price ?? "";
      const image = raw.image || "/images/cake-truffle.jpg";
      const categoryKey = (raw.categoryId || raw.categorySlug || raw.category || "1").toLowerCase();
      const categoryId = categoryLookup.get(categoryKey) ?? Number(categoryKey);

      if (!name) errors.push("Product name missing");
      if (!price || Number.isNaN(Number(price))) errors.push("Valid price missing");
      if (!categoryId || Number.isNaN(categoryId)) errors.push("Category not matched");
      if (!image) errors.push("Image missing");

      const slug = raw.slug || slugify(name);
      const sku = raw.sku || skuify(name || `ROW-${rowNumber}`);
      const galleryImages = uniqueImages([image, ...splitPipeOrComma(raw.images ?? "")]).filter((item) => item !== image);

      return {
        rowNumber,
        raw,
        errors,
        product: errors.length
          ? undefined
          : {
              name,
              sku,
              slug,
              shortDescription: raw.shortDescription ?? "",
              description: raw.description ?? raw.shortDescription ?? "",
              price,
              compareAtPrice: raw.compareAtPrice || null,
              image,
              images: galleryImages,
              categoryId,
              tags: splitPipeOrComma(raw.tags ?? "cake"),
              weightKg: raw.weightKg || "0.5",
              servings: Number(raw.servings || 6),
              stockQuantity: Number(raw.stockQuantity || 100),
              isBestseller: parseBoolean(raw.isBestseller ?? ""),
              isNew: raw.isNew ? parseBoolean(raw.isNew) : true,
            },
      };
    });
  }, [bulkText, categoryLookup]);

  const validBulkRows = useMemo(
    () => bulkPreview.filter((row) => row.product),
    [bulkPreview],
  );
  const invalidBulkRows = bulkPreview.length - validBulkRows.length;

  const invalidateProducts = async () => {
    await utils.product.adminList.invalidate();
    await utils.product.list.invalidate();
    await utils.product.getBestsellers.invalidate();
  };

  const createProduct = trpc.product.create.useMutation({
    onSuccess: async () => {
      toast.success("Product created");
      setFormOpen(false);
      await invalidateProducts();
    },
  });

  const updateProduct = trpc.product.update.useMutation({
    onSuccess: async () => {
      toast.success("Product updated");
      setFormOpen(false);
      await invalidateProducts();
    },
  });

  const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: async () => {
      toast.success("Product deleted");
      await invalidateProducts();
    },
  });
  const bulkCreateProducts = trpc.product.bulkCreate.useMutation({
    onSuccess: async (result) => {
      toast.success(`${result.createdCount} products imported${result.skippedCount ? `, ${result.skippedCount} skipped` : ""}`);
      if (result.errors.length === 0) {
        setBulkOpen(false);
        setBulkText("");
      }
      await invalidateProducts();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const uploadProductImage = trpc.product.uploadImage.useMutation();

  const openCreate = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (product: NonNullable<typeof data>["items"][number]) => {
    setForm({
      id: product.id,
      name: product.name,
      sku: "sku" in product && product.sku ? product.sku : skuify(product.name),
      slug: product.slug,
      shortDescription: product.shortDescription ?? "",
      description: "description" in product && product.description ? product.description : product.shortDescription ?? "",
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? "",
      image: product.image,
      images: Array.isArray(product.images) ? product.images : [],
      categoryId: product.categoryId ?? 1,
      tags: ((product.tags as string[]) ?? []).join(","),
      weightKg: product.weightKg ?? "0.5",
      servings: product.servings ?? 6,
      stockQuantity: "stockQuantity" in product ? product.stockQuantity ?? 100 : 100,
      isBestseller: product.isBestseller ?? false,
      isNew: product.isNew ?? false,
    });
    setFormOpen(true);
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: form.name,
      sku: form.sku || skuify(form.name),
      slug: form.slug || slugify(form.name),
      shortDescription: form.shortDescription,
      description: form.description,
      price: form.price,
      compareAtPrice: form.compareAtPrice || null,
      image: form.image,
      images: uniqueImages(form.images.filter((image) => image !== form.image)),
      categoryId: form.categoryId,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      weightKg: form.weightKg,
      servings: Number(form.servings),
      stockQuantity: Number(form.stockQuantity),
      isBestseller: form.isBestseller,
      isNew: form.isNew,
    };

    if (form.id) {
      updateProduct.mutate({ id: form.id, ...payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  const uploadMainImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    try {
      const dataUrl = await readImageFile(file);
      const { url: image } = await uploadProductImage.mutateAsync({
        fileName: file.name,
        dataUrl,
      });
      setForm((current) => ({
        ...current,
        image,
        images: uniqueImages([image, ...current.images]),
      }));
      toast.success("Main image uploaded");
    } catch {
      toast.error("Image upload failed");
    }
  };

  const uploadGalleryImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please upload image files");
      return;
    }
    try {
      const uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          const dataUrl = await readImageFile(file);
          const { url } = await uploadProductImage.mutateAsync({
            fileName: file.name,
            dataUrl,
          });
          return url;
        })
      );
      setForm((current) => ({
        ...current,
        image: current.image || uploadedImages[0],
        images: uniqueImages([...current.images, ...uploadedImages]),
      }));
      toast.success(`${uploadedImages.length} image${uploadedImages.length > 1 ? "s" : ""} uploaded`);
    } catch {
      toast.error("Image upload failed");
    }
  };

  const loadBulkCsvFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBulkText(String(reader.result ?? ""));
    reader.onerror = () => toast.error("CSV file read failed");
    reader.readAsText(file);
  };

  const importBulkProducts = () => {
    const products = validBulkRows
      .map((row) => row.product)
      .filter((product): product is BulkProductPayload => Boolean(product));

    if (products.length === 0) {
      toast.error("No valid products to import");
      return;
    }

    bulkCreateProducts.mutate({ products });
  };

  const removeGalleryImage = (image: string) => {
    setForm((current) => {
      const images = current.images.filter((item) => item !== image);
      return {
        ...current,
        images,
        image: current.image === image ? images[0] ?? "/images/cake-truffle.jpg" : current.image,
      };
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#6B3A3A]">
              Product Management
            </h2>
            <p className="text-sm text-[#1A1A1A]/50">
              Create, edit, price, tag, categorize and feature catalog items.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setBulkOpen(true)}
              variant="outline"
              className="rounded-full border-[#6B3A3A]/20 bg-white/70 text-[#6B3A3A] hover:bg-[#F8EDEB]"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
            <Button
              onClick={openCreate}
              className="rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90"
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-[#6B3A3A]/10 bg-white/60 p-4 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-[#6B3A3A]">
              <FileSpreadsheet className="h-5 w-5 text-[#F04423]" />
              Bulk Product Upload
            </h3>
            <p className="mt-1 text-sm text-[#1A1A1A]/55">
              Import products by CSV with SKU, category, pricing, stock, tags and image URLs. Preview validates rows before import.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(bulkTemplate)}`}
              download="bakerush-product-bulk-template.csv"
              className="inline-flex items-center gap-2 rounded-full border border-[#6B3A3A]/15 bg-white px-4 py-2 text-sm font-semibold text-[#6B3A3A] hover:bg-[#F8EDEB]"
            >
              <Download className="h-4 w-4" />
              CSV Template
            </a>
            <Button onClick={() => setBulkOpen(true)} className="rounded-full bg-[#F04423] text-white hover:bg-[#d93b1f]">
              Upload CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/40" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search products, tags, flavours..."
              className="w-full rounded-full border border-[#6B3A3A]/15 bg-white/80 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#6B3A3A]/20"
            />
          </div>
          <select
            value={categorySlug}
            onChange={(event) => {
              setCategorySlug(event.target.value);
              setPage(1);
            }}
            className="rounded-full border border-[#6B3A3A]/15 bg-white/80 px-4 py-2 text-sm outline-none"
          >
            <option value="all">All Categories</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#6B3A3A]/10 bg-[#F8EDEB]/50 text-left text-[#1A1A1A]/50">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Flags</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[#1A1A1A]/50">
                      Loading products...
                    </td>
                  </tr>
                ) : (
                  data?.items.map((product) => (
                    <tr key={product.id} className="border-b border-[#6B3A3A]/5 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                          <div>
                            <p className="font-semibold text-[#6B3A3A]">{product.name}</p>
                            <p className="max-w-xs truncate text-xs text-[#1A1A1A]/50">
                              {product.shortDescription}
                            </p>
                            {Array.isArray(product.images) && product.images.length > 0 && (
                              <p className="mt-1 text-xs text-[#F04423]">
                                {product.images.length + 1} product images
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#6B3A3A]/8 px-2.5 py-1 font-mono text-xs font-semibold text-[#6B3A3A]">
                          {"sku" in product && product.sku ? product.sku : skuify(product.name)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {categoryById.get(product.categoryId ?? 0) ?? "Unassigned"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">&#8377;{Number(product.price).toLocaleString()}</p>
                        {product.compareAtPrice && (
                          <p className="text-xs text-[#1A1A1A]/40 line-through">
                            &#8377;{Number(product.compareAtPrice).toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {"stockQuantity" in product ? product.stockQuantity ?? 100 : 100}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {product.isBestseller && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                              Bestseller
                            </span>
                          )}
                          {product.isNew && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteProduct.mutate({ id: product.id })}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: data.totalPages }, (_, index) => index + 1).map((targetPage) => (
              <button
                key={targetPage}
                onClick={() => setPage(targetPage)}
                className={`h-10 w-10 rounded-full text-sm font-medium ${
                  targetPage === page
                    ? "bg-[#6B3A3A] text-white"
                    : "border border-[#6B3A3A]/15 bg-white/80"
                }`}
              >
                {targetPage}
              </button>
            ))}
          </div>
        )}

        <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
          <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-[#6B3A3A]">
                Bulk Product Upload
              </DialogTitle>
            </DialogHeader>

            <div className="mt-2 grid gap-4">
              <div className="grid gap-3 rounded-2xl border border-[#6B3A3A]/10 bg-[#FFF7F0] p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h3 className="font-semibold text-[#2f1b14]">CSV columns supported</h3>
                  <p className="mt-1 text-sm text-[#1A1A1A]/55">
                    name, sku, slug, categorySlug/categoryId, price, compareAtPrice, shortDescription, description, image, images, tags, weightKg, servings, stockQuantity, isBestseller, isNew.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`data:text/csv;charset=utf-8,${encodeURIComponent(bulkTemplate)}`}
                    download="bakerush-product-bulk-template.csv"
                    className="inline-flex items-center gap-2 rounded-full border border-[#6B3A3A]/15 bg-white px-4 py-2 text-sm font-semibold text-[#6B3A3A] hover:bg-[#F8EDEB]"
                  >
                    <Download className="h-4 w-4" />
                    Template
                  </a>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#6B3A3A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6B3A3A]/90">
                    <UploadCloud className="h-4 w-4" />
                    Choose CSV
                    <input type="file" accept=".csv,text/csv" onChange={loadBulkCsvFile} className="sr-only" />
                  </label>
                </div>
              </div>

              <Field label="Paste CSV data">
                <textarea
                  value={bulkText}
                  onChange={(event) => setBulkText(event.target.value)}
                  className="admin-input min-h-48 font-mono text-xs"
                  placeholder={bulkTemplate}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1A1A]/45">Rows parsed</p>
                  <p className="mt-1 text-2xl font-bold text-[#2f1b14]">{bulkPreview.length}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700/70">Ready</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{validBulkRows.length}</p>
                </div>
                <div className="rounded-2xl bg-red-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700/70">Needs fix</p>
                  <p className="mt-1 text-2xl font-bold text-red-700">{invalidBulkRows}</p>
                </div>
              </div>

              {bulkPreview.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-[#6B3A3A]/10 bg-white">
                  <div className="max-h-80 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-[#F8EDEB] text-left text-[#1A1A1A]/55">
                        <tr>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Row</th>
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">SKU</th>
                          <th className="px-4 py-3 font-medium">Category</th>
                          <th className="px-4 py-3 font-medium">Price</th>
                          <th className="px-4 py-3 font-medium">Issues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkPreview.slice(0, 80).map((row) => (
                          <tr key={row.rowNumber} className="border-t border-[#6B3A3A]/5">
                            <td className="px-4 py-3">
                              {row.errors.length ? (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">{row.rowNumber}</td>
                            <td className="px-4 py-3 font-semibold text-[#6B3A3A]">{row.product?.name ?? row.raw.name}</td>
                            <td className="px-4 py-3 font-mono text-xs">{row.product?.sku ?? row.raw.sku}</td>
                            <td className="px-4 py-3">{categoryById.get(row.product?.categoryId ?? 0) ?? row.raw.categorySlug ?? row.raw.categoryId}</td>
                            <td className="px-4 py-3">&#8377;{row.product?.price ?? row.raw.price}</td>
                            <td className="px-4 py-3 text-xs text-red-600">
                              {row.errors.join(", ") || "Ready"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {bulkPreview.length > 80 && (
                    <p className="border-t border-[#6B3A3A]/10 px-4 py-3 text-xs text-[#1A1A1A]/45">
                      Showing first 80 rows in preview. Import will process all valid rows.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={importBulkProducts}
                  disabled={bulkCreateProducts.isPending || validBulkRows.length === 0}
                  className="bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90"
                >
                  {bulkCreateProducts.isPending ? "Importing..." : `Import ${validBulkRows.length} Products`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-[#6B3A3A]">
                {form.id ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={submitForm} className="mt-2 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Product Name">
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                        sku: form.sku || skuify(event.target.value),
                        slug: form.slug || slugify(event.target.value),
                      })
                    }
                    className="admin-input"
                  />
                </Field>
                <Field label="Slug">
                  <input
                    value={form.slug}
                    onChange={(event) => setForm({ ...form, slug: event.target.value })}
                    className="admin-input"
                  />
                </Field>
              </div>

              <Field label="SKU">
                <input
                  required
                  value={form.sku}
                  onChange={(event) => setForm({ ...form, sku: event.target.value.toUpperCase() })}
                  className="admin-input font-mono"
                  placeholder="BR-CK-TRF-0500"
                />
              </Field>

              <Field label="Short Description">
                <input
                  value={form.shortDescription}
                  onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
                  className="admin-input"
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="admin-input min-h-24"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Price">
                  <input
                    required
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Compare Price">
                  <input
                    value={form.compareAtPrice}
                    onChange={(event) => setForm({ ...form, compareAtPrice: event.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Stock">
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(event) =>
                      setForm({ ...form, stockQuantity: Number(event.target.value) })
                    }
                    className="admin-input"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Category">
                  <select
                    value={form.categoryId}
                    onChange={(event) => setForm({ ...form, categoryId: Number(event.target.value) })}
                    className="admin-input"
                  >
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Weight Kg">
                  <input
                    value={form.weightKg}
                    onChange={(event) => setForm({ ...form, weightKg: event.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Servings">
                  <input
                    type="number"
                    value={form.servings}
                    onChange={(event) => setForm({ ...form, servings: Number(event.target.value) })}
                    className="admin-input"
                  />
                </Field>
              </div>

              <div className="rounded-2xl border border-[#6B3A3A]/10 bg-white/70 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[#6B3A3A]">
                      Product Images
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/50">
                      Upload main product image and gallery photos for product detail page.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#6B3A3A]/15 bg-white px-4 py-2 text-sm font-semibold text-[#6B3A3A] transition-colors hover:bg-[#F8EDEB]">
                      <UploadCloud className="h-4 w-4" />
                      Main Image
                      <input type="file" accept="image/*" onChange={uploadMainImage} className="sr-only" />
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#6B3A3A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6B3A3A]/90">
                      <ImagePlus className="h-4 w-4" />
                      Gallery Upload
                      <input type="file" accept="image/*" multiple onChange={uploadGalleryImages} className="sr-only" />
                    </label>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/50">
                      Main Image
                    </p>
                    <div className="overflow-hidden rounded-2xl border border-[#6B3A3A]/10 bg-white">
                      <div className="aspect-square">
                        <img src={form.image} alt="Main product preview" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Field label="Image URL or uploaded data">
                      <input
                        required
                        value={form.image}
                        onChange={(event) => setForm({ ...form, image: event.target.value })}
                        className="admin-input"
                      />
                    </Field>

                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/50">
                        Gallery Images
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {uniqueImages([form.image, ...form.images]).map((image) => {
                          const isMainImage = image === form.image;
                          return (
                            <div key={image} className="group relative overflow-hidden rounded-xl border border-[#6B3A3A]/10 bg-white">
                              <div className="aspect-square">
                                <img src={image} alt="Product gallery preview" className="h-full w-full object-cover" />
                              </div>
                              <div className="absolute inset-x-2 bottom-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                {!isMainImage && (
                                  <button
                                    type="button"
                                    onClick={() => setForm({ ...form, image })}
                                    className="flex-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#6B3A3A] shadow-sm"
                                  >
                                    Set main
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(image)}
                                  className="rounded-lg bg-white px-2 py-1 text-red-600 shadow-sm"
                                  aria-label="Remove image"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {isMainImage && (
                                <span className="absolute left-2 top-2 rounded-full bg-[#6B3A3A] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                  Main
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Field label="Tags comma separated">
                <input
                  value={form.tags}
                  onChange={(event) => setForm({ ...form, tags: event.target.value })}
                  className="admin-input"
                />
              </Field>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-[#6B3A3A]">
                  <input
                    type="checkbox"
                    checked={form.isBestseller}
                    onChange={(event) => setForm({ ...form, isBestseller: event.target.checked })}
                  />
                  Bestseller
                </label>
                <label className="flex items-center gap-2 text-sm text-[#6B3A3A]">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(event) => setForm({ ...form, isNew: event.target.checked })}
                  />
                  New arrival
                </label>
              </div>

              <Button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90"
              >
                {form.id ? "Save Product" : "Create Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#6B3A3A]">
      {label}
      {children}
    </label>
  );
}
