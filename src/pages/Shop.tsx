import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { Star, SlidersHorizontal, Search, X } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "newest");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));
  const deferredSearch = useDeferredValue(searchQuery.trim());
  const collectionSlug = searchParams.get("collection") ?? undefined;
  const occasionSlug = searchParams.get("occasion") ?? undefined;

  const { data: productsData } = trpc.product.list.useQuery({
    categorySlug: selectedCategory === "all" ? undefined : selectedCategory,
    collectionSlug,
    occasionSlug,
    search: deferredSearch || undefined,
    sort: sortBy as "newest" | "price_asc" | "price_desc" | "bestsellers",
    page,
    limit: 12,
  });

  const { data: categories } = trpc.product.getCategories.useQuery();
  const { data: collectionMenus } = trpc.commerce.listCollectionMenus.useQuery();
  const { data: occasionSections } = trpc.commerce.listOccasionSections.useQuery();
  const addItem = useCartStore((s) => s.addItem);

  const activeCollection = useMemo(() => {
    if (!collectionSlug) return null;
    return collectionMenus
      ?.flatMap((menu) => menu.columns.flatMap((column) => column.items))
      .find((item) => item.slug === collectionSlug) ?? null;
  }, [collectionMenus, collectionSlug]);

  const activeOccasion = useMemo(
    () => occasionSections?.find((section) => section.slug === occasionSlug) ?? null,
    [occasionSections, occasionSlug],
  );

  const popularSearches = useMemo(
    () => [
      "Chocolate cakes",
      "Birthday cakes",
      "Eggless cakes",
      "Photo cakes",
      "Rasmalai cake",
      "Same day",
    ],
    [],
  );

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    });
    next.delete("page");
    setPage(1);
    setSearchParams(next);
  };

  useEffect(() => {
    setSearchQuery(searchParams.get("search") ?? "");
    setSelectedCategory(searchParams.get("category") ?? "all");
    setSortBy(searchParams.get("sort") ?? "newest");
    setPage(Number(searchParams.get("page") ?? 1));
  }, [searchParams]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ search: searchQuery.trim() || null });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handleAddToCart = (product: {
    id: number;
    name: string;
    sku?: string;
    price: string;
    image: string;
    slug: string;
  }) => {
    addItem({
      id: Date.now(),
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      image: product.image,
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-[#6B3A3A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-3">
            {activeCollection?.name ?? activeOccasion?.title ?? "Find Cakes & Gifts"}
          </h1>
          <p className="text-white/70 text-lg">
            Search by flavour, occasion, collection, delivery city, recipient or price.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 rounded-2xl border border-[#6B3A3A]/10 bg-white/75 p-4 shadow-sm">
          <form onSubmit={submitSearch} className="flex flex-col gap-3 lg:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1A1A1A]/40" />
            <input
              type="text"
              placeholder="Search chocolate cakes, birthday gifts, eggless, Delhi delivery..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
                className="h-12 w-full rounded-xl border border-[#6B3A3A]/15 bg-white pl-12 pr-11 text-sm outline-none focus:ring-2 focus:ring-[#6B3A3A]/20"
            />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(""); updateParams({ search: null }); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#1A1A1A]/40 hover:bg-[#F8EDEB]">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <div className="flex gap-2">
              <Button type="submit" className="h-12 rounded-xl bg-[#6B3A3A] px-6 text-white hover:bg-[#6B3A3A]/90">
                Search
              </Button>
            <select
              value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateParams({ sort: e.target.value === "newest" ? null : e.target.value });
                }}
                className="h-12 rounded-xl border border-[#6B3A3A]/15 bg-white px-4 text-sm outline-none"
            >
              <option value="newest">Newest</option>
              <option value="bestsellers">Bestsellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <Button
                type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
                className="h-12 rounded-xl border-[#6B3A3A]/20"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchQuery(term);
                  updateParams({ search: term });
                }}
                className="rounded-full border border-[#6B3A3A]/12 bg-[#F8EDEB]/65 px-3 py-1.5 text-xs font-semibold text-[#6B3A3A] hover:bg-[#6B3A3A] hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>

          {(deferredSearch || activeCollection || activeOccasion || selectedCategory !== "all") && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold uppercase tracking-[0.14em] text-[#1A1A1A]/45">Active:</span>
              {deferredSearch && <FilterPill label={`Search: ${deferredSearch}`} onRemove={() => { setSearchQuery(""); updateParams({ search: null }); }} />}
              {activeCollection && <FilterPill label={`Collection: ${activeCollection.name}`} onRemove={() => updateParams({ collection: null })} />}
              {activeOccasion && <FilterPill label={`Occasion: ${activeOccasion.event}`} onRemove={() => updateParams({ occasion: null })} />}
              {selectedCategory !== "all" && <FilterPill label={`Category: ${selectedCategory}`} onRemove={() => { setSelectedCategory("all"); updateParams({ category: null }); }} />}
              <button onClick={clearAllFilters} className="font-semibold text-red-600 hover:underline">Clear all</button>
            </div>
          )}
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8"
          >
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  updateParams({ category: null });
                }}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCategory === "all"
                    ? "bg-[#6B3A3A] text-white"
                    : "bg-white/80 border border-[#6B3A3A]/15 hover:bg-[#6B3A3A]/5"
                }`}
              >
                All Cakes
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    updateParams({ category: cat.slug });
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-[#6B3A3A] text-white"
                      : "bg-white/80 border border-[#6B3A3A]/15 hover:bg-[#6B3A3A]/5"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <p className="text-sm text-[#1A1A1A]/60 mb-6">
          {productsData?.total ?? 0} results found
        </p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {productsData?.items.length ? productsData.items.map((product) => (
            <motion.div key={product.id} variants={fadeInUp}>
              <div className="group bg-[#F8EDEB] rounded-2xl overflow-hidden transition-shadow hover:shadow-xl">
                <Link to={`/shop/${product.slug}`}>
                  <div className="relative aspect-square overflow-hidden bg-white/50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.isBestseller && (
                      <span className="absolute top-3 left-3 bg-[#6B3A3A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Bestseller
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/shop/${product.slug}`}>
                    <h3 className="font-display text-lg font-semibold text-[#6B3A3A] mb-1 group-hover:text-[#D4A373] transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[#1A1A1A]/50 text-xs mb-3 line-clamp-1">
                    {product.shortDescription}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B3A3A] font-semibold">
                        &#8377;{Number(product.price).toLocaleString()}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-[#1A1A1A]/40 text-sm line-through">
                          &#8377;
                          {Number(product.compareAtPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-[#D4A373] text-[#D4A373]" />
                      <span className="text-xs text-[#1A1A1A]/60">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-3 bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full text-xs uppercase tracking-wider"
                    size="sm"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full rounded-2xl border border-[#6B3A3A]/10 bg-white/70 p-10 text-center">
              <h2 className="font-display text-2xl font-semibold text-[#6B3A3A]">No matching products</h2>
              <p className="mt-2 text-sm text-[#1A1A1A]/55">Try chocolate, birthday, eggless, rasmalai or clear filters.</p>
              <Button onClick={clearAllFilters} className="mt-5 rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90">Reset Search</Button>
            </div>
          )}
        </motion.div>

        {productsData && productsData.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: productsData.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-[#6B3A3A] text-white"
                      : "bg-white/80 border border-[#6B3A3A]/15"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#6B3A3A] px-3 py-1.5 font-semibold text-white">
      {label}
      <button type="button" onClick={onRemove} className="rounded-full bg-white/15 p-0.5 hover:bg-white/25">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
