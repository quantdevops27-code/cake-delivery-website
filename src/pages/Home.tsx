import { Link } from "react-router";
import { useMemo, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";

const categoryTiles = [
  { id: 1, name: "Classic", slug: "classic", image: "/images/cake-blackforest.jpg", description: "Chocolate, vanilla and pineapple favourites" },
  { id: 2, name: "Gourmet", slug: "gourmet", image: "/images/cake-truffle.jpg", description: "Premium flavours and indulgent layers" },
  { id: 3, name: "Designer", slug: "designer", image: "/images/cake-floral.jpg", description: "Theme, photo and custom celebration cakes" },
  { id: 4, name: "Desserts", slug: "desserts", image: "/images/cake-cheesecake.jpg", description: "Cheesecakes, pastries and sweet boxes" },
];

const productSamples = [
  {
    id: 1,
    name: "Rich Chocolate Truffle Cake",
    slug: "rich-chocolate-truffle-cake",
    shortDescription: "Bestseller chocolate truffle",
    price: "549.00",
    compareAtPrice: null,
    image: "/images/cake-truffle.jpg",
    rating: "4.9",
    reviewCount: 8500,
    isBestseller: true,
    isNew: false,
  },
  {
    id: 2,
    name: "Rose Pistachio Rasmalai Cake",
    slug: "rose-pistachio-rasmalai-cake",
    shortDescription: "Festive premium fusion cake",
    price: "699.00",
    compareAtPrice: "799.00",
    image: "/images/cake-pistachio.jpg",
    rating: "4.8",
    reviewCount: 570,
    isBestseller: true,
    isNew: true,
  },
  {
    id: 3,
    name: "Classic Black Forest Cake",
    slug: "classic-black-forest-cake",
    shortDescription: "Classic cherry chocolate cake",
    price: "549.00",
    compareAtPrice: null,
    image: "/images/cake-blackforest.jpg",
    rating: "4.9",
    reviewCount: 1000,
    isBestseller: true,
    isNew: false,
  },
  {
    id: 4,
    name: "Blueberry Bliss Cheesecake",
    slug: "blueberry-bliss-cheesecake",
    shortDescription: "Creamy blueberry cheesecake",
    price: "779.00",
    compareAtPrice: null,
    image: "/images/cake-cheesecake.jpg",
    rating: "4.9",
    reviewCount: 785,
    isBestseller: true,
    isNew: false,
  },
];

const quickFilters = [
  "Birthday",
  "Anniversary",
  "Eggless",
  "Chocolate",
  "Photo Cakes",
  "Same Day",
];

const cityList = ["Delhi NCR", "Bangalore", "Mumbai", "Hyderabad", "Pune", "Chennai"];

const fallbackHeroSlides = [
  {
    title: "Fresh cakes delivered today",
    highlight: "delivered today",
    text: "Browse premium celebration cakes, pick your delivery slot, and track every order from bakery bench to doorstep.",
    product: "Signature Truffle",
    image: "/images/cake-truffle.jpg",
    price: "549",
    accent: "#ffcf62",
    mood: "rgba(255, 198, 86, 0.62)",
    wash: "linear-gradient(135deg, #351308 0%, #6f2f10 43%, #c76a22 100%)",
    searchPlaceholder: "Search chocolate, rasmalai, photo cakes...",
    badgeOne: "Scroll hero",
    badgeTwo: "Scene changes",
    badgeThree: "Same day delivery",
  },
  {
    title: "Rasmalai, rose, pistachio, celebration-ready",
    highlight: "pistachio",
    text: "Premium Indian fusion cakes with same-day city slots and gift-ready packaging.",
    product: "Rose Pistachio Rasmalai",
    image: "/images/cake-pistachio.jpg",
    price: "699",
    accent: "#b9f6ca",
    mood: "rgba(160, 255, 191, 0.64)",
    wash: "linear-gradient(135deg, #10291c 0%, #28643b 44%, #b28a3c 100%)",
    searchPlaceholder: "Search rasmalai, pistachio, festive cakes...",
    badgeOne: "Fusion cakes",
    badgeTwo: "Premium packaging",
    badgeThree: "Fresh dispatch",
  },
  {
    title: "Cheesecake and dessert boxes for every mood",
    highlight: "every mood",
    text: "Switch from birthday cakes to dessert hampers without losing delivery speed.",
    product: "Blueberry Bliss Cheesecake",
    image: "/images/cake-cheesecake.jpg",
    price: "779",
    accent: "#b7d8ff",
    mood: "rgba(160, 207, 255, 0.68)",
    wash: "linear-gradient(135deg, #101a3a 0%, #304b91 44%, #7e4fa6 100%)",
    searchPlaceholder: "Search cheesecake, brownies, dessert boxes...",
    badgeOne: "Dessert boxes",
    badgeTwo: "Gift ready",
    badgeThree: "Fast checkout",
  },
];

const proofPoints = [
  { Icon: Truck, title: "Delivery engine", text: "City, slot and tracking surfaces are visible from the first screen." },
  { Icon: ShieldCheck, title: "Trust layer", text: "Ratings, reviews, freshness promises and secure checkout cues." },
  { Icon: Sparkles, title: "Premium browsing", text: "Occasion filters and 3D product showcase create a richer feel." },
  { Icon: CheckCircle2, title: "Backend-ready", text: "Hono, tRPC, Drizzle schema and demo fallback are wired for local preview." },
];

function HighlightedTitle({
  title,
  highlight,
  accent,
}: {
  title: string;
  highlight: string;
  accent: string;
}) {
  const index = title.toLowerCase().indexOf(highlight.toLowerCase());
  if (index === -1) return <>{title}</>;

  const before = title.slice(0, index);
  const match = title.slice(index, index + highlight.length);
  const after = title.slice(index + highlight.length);

  return (
    <>
      {before}
      <span
        className="bg-clip-text text-transparent drop-shadow-[0_8px_24px_rgba(255,255,255,0.14)]"
        style={{
          backgroundImage: `linear-gradient(90deg, ${accent}, #ffffff 55%, ${accent})`,
        }}
      >
        {match}
      </span>
      {after}
    </>
  );
}

export default function Home() {
  const { data: apiBestsellers } = trpc.product.getBestsellers.useQuery({ limit: 8 });
  const { data: apiCategories } = trpc.product.getCategories.useQuery();
  const { data: apiHeroSlides } = trpc.site.getHeroSlides.useQuery();
  const heroRef = useRef<HTMLElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });
  const cakeRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-8, 8, -10]);
  const cakeScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.08, 0.98]);
  const cakeY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const stageX = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const priceY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const dispatchY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const slideOneOpacity = useTransform(scrollYProgress, [0, 0.24, 0.38], [1, 1, 0]);
  const slideTwoOpacity = useTransform(scrollYProgress, [0.24, 0.42, 0.64, 0.78], [0, 1, 1, 0]);
  const slideThreeOpacity = useTransform(scrollYProgress, [0.62, 0.8, 1], [0, 1, 1]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const nextSlide = value < 0.34 ? 0 : value < 0.68 ? 1 : 2;
    setActiveSlide((current) => (current === nextSlide ? current : nextSlide));
  });

  const categories = apiCategories?.length ? apiCategories : categoryTiles;
  const bestsellers = apiBestsellers?.length ? apiBestsellers : productSamples;
  const heroSlides = useMemo(() => {
    const slides = apiHeroSlides?.length ? apiHeroSlides : fallbackHeroSlides;
    return slides.length >= 3 ? slides.slice(0, 3) : fallbackHeroSlides;
  }, [apiHeroSlides]);
  const hero = heroSlides[activeSlide];

  return (
    <main className="bg-[#fffaf4] text-[#312018]">
      <section ref={heroRef} className="relative h-[240vh] bg-[#1f1712]">
        <div className="sticky top-0 isolate min-h-screen overflow-hidden text-white">
          <motion.div
            style={{ opacity: slideOneOpacity, background: heroSlides[0].wash }}
            className="absolute inset-0 -z-40"
          />
          <motion.div
            style={{ opacity: slideTwoOpacity, background: heroSlides[1].wash }}
            className="absolute inset-0 -z-40"
          />
          <motion.div
            style={{ opacity: slideThreeOpacity, background: heroSlides[2].wash }}
            className="absolute inset-0 -z-40"
          />
          <img
            src="/images/texture-chocolate.jpg"
            alt=""
            className="absolute inset-0 -z-30 h-full w-full object-cover opacity-18 mix-blend-soft-light"
          />
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(14,10,8,0.82)_0%,rgba(14,10,8,0.72)_36%,rgba(14,10,8,0.38)_68%,rgba(14,10,8,0.20)_100%)]" />
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_74%_42%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0)_34%)]" />
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0)_36%,rgba(0,0,0,0.28)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-[linear-gradient(0deg,#fffaf4_0%,rgba(255,250,244,0)_100%)]" />

          <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 pb-14 pt-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pt-36">
            <div className="max-w-2xl">
              <div className="mb-5 flex flex-wrap gap-2">
                {[hero.badgeOne, hero.badgeTwo, hero.badgeThree].map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase text-[#ffe0b8] backdrop-blur"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <motion.div
                key={hero.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <h1 className="text-balance font-display text-5xl font-bold leading-[0.96] text-white sm:text-6xl lg:text-7xl">
                  <HighlightedTitle
                    title={hero.title}
                    highlight={hero.highlight}
                    accent={hero.accent}
                  />
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-white/78">
                  {hero.text}
                </p>
              </motion.div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const input = event.currentTarget.elements.namedItem("hero-search") as HTMLInputElement;
                  if (input.value.trim()) {
                    window.location.href = `/shop?search=${encodeURIComponent(input.value.trim())}`;
                  }
                }}
                className="mt-8 grid max-w-2xl gap-3 rounded-lg border border-white/15 bg-white/12 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-md sm:grid-cols-[1fr_auto]"
              >
                <label className="relative block">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#d65c27]" />
                  <input
                    name="hero-search"
                    placeholder={hero.searchPlaceholder}
                    className="h-14 w-full rounded-md border border-white/15 bg-white pl-12 pr-4 text-sm text-[#2f211b] outline-none focus:border-[#ffb86f] focus:ring-2 focus:ring-[#ffb86f]/40"
                  />
                </label>
                <Button
                  style={{ backgroundColor: hero.accent }}
                  className="h-14 rounded-md px-7 font-black text-[#2f211b] hover:brightness-105"
                >
                  Find Cakes
                </Button>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  {quickFilters.map((filter) => (
                    <Link
                      key={filter}
                      to={`/shop?search=${encodeURIComponent(filter)}`}
                      className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#ffcf62] hover:text-[#ffcf62]"
                    >
                      {filter}
                    </Link>
                  ))}
                </div>
              </form>

              <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["2 hr", "express slots"],
                  ["500+", "cake designs"],
                  ["4.9", "avg rating"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-white/60">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[360px] [perspective:1200px] sm:min-h-[520px]">
              <motion.div
                style={{ x: stageX, y: cakeY, rotateY: cakeRotate, scale: cakeScale }}
                className="absolute right-0 top-8 w-[min(92vw,620px)] [transform-style:preserve-3d]"
              >
                <div
                  className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/10 p-3 shadow-[0_34px_110px_rgba(0,0,0,0.45)] backdrop-blur-sm"
                  style={{ boxShadow: `0 34px 110px rgba(0,0,0,0.45), 0 0 90px ${hero.mood}` }}
                >
                  <motion.img
                    key={hero.image}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45 }}
                    src={hero.image}
                    alt={hero.product}
                    className="aspect-[4/3] w-full rounded-[24px] object-cover"
                  />
                  <div className="absolute left-7 top-7 rounded-md bg-white px-4 py-2 text-sm font-black text-[#2f211b] shadow-md">
                    Scroll changes scene
                  </div>
                </div>
              </motion.div>

              <motion.div
                style={{ y: priceY, backgroundColor: hero.accent }}
                className="absolute bottom-16 right-0 rounded-2xl p-5 text-[#2f211b] shadow-2xl"
              >
                <p className="text-xs font-bold uppercase">Now showing</p>
                <p className="mt-1 text-xl font-black">{hero.product}</p>
                <p className="mt-2 text-3xl font-black">&#8377;{hero.price}</p>
              </motion.div>

              <motion.div
                style={{ y: dispatchY }}
                className="absolute bottom-4 left-0 hidden rounded-xl bg-[#effff5] p-4 text-[#204232] shadow-2xl sm:block"
              >
                <PackageCheck className="h-6 w-6 text-[#168451]" />
                <p className="mt-2 text-sm font-black">Fresh-packed dispatch</p>
                <p className="text-xs text-[#587665]">Background and cake change on scroll</p>
              </motion.div>

              <div className="absolute right-0 top-0 flex gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.product}
                    type="button"
                    className={`h-2.5 rounded-full transition-all ${
                      activeSlide === index ? "w-10 bg-white" : "w-2.5 bg-white/35"
                    }`}
                    aria-label={`Hero scene ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#f0dfd0] bg-white py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-4 sm:px-6 lg:px-8">
          {cityList.map((city) => (
            <Link key={city} to="/shop" className="flex items-center gap-2 rounded-md border border-[#ead8c8] px-4 py-2 text-sm font-semibold text-[#604436] hover:border-[#e5522d] hover:text-[#e5522d]">
              <MapPin className="h-4 w-4" />
              {city}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl font-bold text-[#2f211b]">What will you wish for?</h2>
              <p className="mt-2 text-[#765f51]">Occasion-first browsing, made faster than a menu maze.</p>
            </div>
            <Button asChild variant="outline" className="hidden rounded-md border-[#cfa88e] text-[#6b4735] hover:bg-[#fff3e4] sm:inline-flex">
              <Link to="/shop">All categories</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group overflow-hidden rounded-lg border border-[#ead8c8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[4/3] overflow-hidden bg-[#fff3e4]">
                  <img src={cat.image ?? "/images/hero-cake.jpg"} alt={cat.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-black text-[#2f211b]">{cat.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[#765f51]">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7efe7] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-4xl font-bold text-[#2f211b]">India loves these</h2>
              <p className="mt-2 text-[#765f51]">Bestsellers with clear price, rating, offer and delivery action.</p>
            </div>
            <Button asChild className="w-fit rounded-md bg-[#2f241d] text-white hover:bg-[#463428]">
              <Link to="/shop">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <h2 className="font-display text-4xl font-bold text-[#2f211b]">Built better than a regular cake listing</h2>
            <p className="mt-4 text-lg leading-8 text-[#765f51]">
              The experience focuses on fast discovery, trust and order confidence: the things a serious cake delivery business needs.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {proofPoints.map(({ Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-[#ead8c8] bg-[#fffaf4] p-5">
                <Icon className="h-7 w-7 text-[#e5522d]" />
                <h3 className="mt-4 text-lg font-black text-[#2f211b]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#765f51]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#2f241d] py-16 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <h2 className="font-display text-4xl font-bold">Ready for a full ecommerce finish</h2>
            <p className="mt-3 max-w-2xl text-white/70">
              Next step is product detail, checkout and admin polish in the same system, with real database credentials when you want live backend data.
            </p>
          </div>
          <Button asChild className="h-12 rounded-md bg-[#ffcf62] px-8 font-black text-[#2f241d] hover:bg-[#ffd977]">
            <Link to="/shop">Start shopping</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function ProductCard({
  product,
}: {
  product: {
    id: number;
    name: string;
    slug: string;
    shortDescription: string | null;
    price: string;
    compareAtPrice: string | null;
    image: string;
    rating: string | null;
    reviewCount: number | null;
    isBestseller: boolean | null;
    isNew: boolean | null;
  };
}) {
  const discount =
    product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)
      ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
      : null;

  return (
    <Link to={`/shop/${product.slug}`} className="group block overflow-hidden rounded-lg border border-[#ead8c8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-[#fff3e4]">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {product.isBestseller && (
          <span className="absolute left-3 top-3 rounded-md bg-[#2f241d] px-2.5 py-1 text-[11px] font-bold uppercase text-white">
            Bestseller
          </span>
        )}
        {discount && (
          <span className="absolute right-3 top-3 rounded-md bg-[#168451] px-2.5 py-1 text-[11px] font-bold uppercase text-white">
            {discount}% off
          </span>
        )}
        <button className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white text-[#e5522d] shadow-md transition group-hover:scale-105" aria-label="Save cake">
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[48px] text-base font-black leading-6 text-[#2f211b]">{product.name}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-[#765f51]">{product.shortDescription}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-black text-[#2f211b]">&#8377;{Number(product.price).toLocaleString()}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-[#9a8172] line-through">&#8377;{Number(product.compareAtPrice).toLocaleString()}</span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#168451] px-2 py-1 text-xs font-bold text-white">
            {product.rating ?? "4.9"} <Star className="h-3 w-3 fill-white" />
          </span>
          <span className="text-xs font-semibold text-[#765f51]">
            {(product.reviewCount ?? 0).toLocaleString()} reviews
          </span>
        </div>
      </div>
    </Link>
  );
}
