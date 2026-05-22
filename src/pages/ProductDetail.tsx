import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Check,
  Clock,
  Gift,
  Heart,
  MapPin,
  MessageSquareText,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

const weightOptions = [
  { label: "0.5 Kg", serving: "4 - 5 People", multiplier: 1 },
  { label: "1 Kg", serving: "8 - 10 People", multiplier: 1.75 },
  { label: "1.5 Kg", serving: "12 - 15 People", multiplier: 2.45 },
  { label: "2 Kg", serving: "16 - 20 People", multiplier: 3.15 },
  { label: "4 Kg", serving: "35 - 40 People", multiplier: 5.8 },
];

const fallbackAddOnOptions = [
  {
    id: 1,
    name: "Happy Birthday Topper",
    description: "Gold acrylic topper",
    price: "149.00",
    image: "/images/cake-floral.jpg",
  },
  {
    id: 2,
    name: "Magic Candles",
    description: "Pack of 10 candles",
    price: "79.00",
    image: "/images/cake-velvet.jpg",
  },
  {
    id: 3,
    name: "Mini Rose Bouquet",
    description: "Fresh flower add-on",
    price: "299.00",
    image: "/images/cake-pistachio.jpg",
  },
  {
    id: 4,
    name: "Brownie Bites Box",
    description: "6 bite-size desserts",
    price: "249.00",
    image: "/images/cake-caramel.jpg",
  },
];

const promiseCards = [
  { icon: Truck, title: "Same day delivery", copy: "Express slots in selected pincodes" },
  { icon: ShieldCheck, title: "Fresh bakery dispatch", copy: "Packed only after slot confirmation" },
  { icon: CalendarClock, title: "Midnight slots", copy: "Surprise delivery windows available" },
];

const savedDeliveryLocationKey = "bakerush-delivery-location";

function formatPrice(value: number) {
  return Math.round(value).toLocaleString();
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = trpc.product.getBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );
  const { data: apiAddOns } = trpc.commerce.listAddOns.useQuery(
    { productSlug: slug ?? "" },
    { enabled: !!slug }
  );
  const [quantity, setQuantity] = useState(1);
  const [cakeMessage, setCakeMessage] = useState("");
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[0]);
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [lookupPincode, setLookupPincode] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [availability, setAvailability] = useState<"idle" | "available" | "error">("idle");
  const addItem = useCartStore((s) => s.addItem);
  const { data: pincodeResult } = trpc.commerce.validatePincode.useQuery(
    { pincode: lookupPincode },
    { enabled: lookupPincode.length === 6 }
  );

  const gallery = useMemo(() => {
    if (!product) return [];
    const images = [
      product.image,
      ...(product.images ?? []),
      "/images/cake-truffle.jpg",
      "/images/cake-pistachio.jpg",
      "/images/cake-cheesecake.jpg",
    ];
    return Array.from(new Set(images.filter(Boolean))).slice(0, 5);
  }, [product]);

  const activeImage = selectedImage ?? gallery[0];

  const addOnOptions = apiAddOns?.length ? apiAddOns : fallbackAddOnOptions;
  const selectedAddOnItems = addOnOptions.filter((addOn) =>
    selectedAddOns.includes(addOn.id)
  );
  const serviceableLocations = pincodeResult?.locations ?? [];
  const selectedLocation =
    serviceableLocations.find((location) => location.id === selectedLocationId) ??
    serviceableLocations[0] ??
    null;

  useEffect(() => {
    const saved = window.localStorage.getItem(savedDeliveryLocationKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as {
        pincode?: string;
        locationId?: number;
      };
      if (parsed.pincode) {
        setPincode(parsed.pincode);
        setLookupPincode(parsed.pincode);
      }
      if (parsed.locationId) setSelectedLocationId(parsed.locationId);
    } catch {
      window.localStorage.removeItem(savedDeliveryLocationKey);
    }
  }, []);

  useEffect(() => {
    if (!lookupPincode || !pincodeResult) return;
    if (!pincodeResult.serviceable) {
      setAvailability("error");
      setSelectedLocationId(null);
      return;
    }
    setAvailability("available");
    if (!selectedLocationId || !pincodeResult.locations.some((location) => location.id === selectedLocationId)) {
      setSelectedLocationId(pincodeResult.location?.id ?? null);
    }
  }, [lookupPincode, pincodeResult, selectedLocationId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6B3A3A] border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 font-display text-2xl text-[#6B3A3A]">
            Product Not Found
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-[#D4A373] hover:underline"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const basePrice = Number(product.price);
  const unitPrice = Math.round(basePrice * selectedWeight.multiplier);
  const addOnTotal = selectedAddOnItems.reduce((sum, addOn) => sum + Number(addOn.price), 0);
  const itemPrice = unitPrice + addOnTotal;
  const payableTotal = itemPrice * quantity;
  const discount = product.compareAtPrice
    ? Math.round(
        ((Number(product.compareAtPrice) - basePrice) / Number(product.compareAtPrice)) * 100
      )
    : 0;

  const toggleAddOn = (id: number) => {
    setSelectedAddOns((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const checkAvailability = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setAvailability("error");
      toast.error("Enter a valid 6 digit pincode");
      return;
    }
    setLookupPincode(pincode);
  };

  const saveDeliveryLocation = () => {
    if (!selectedLocation) return;
    window.localStorage.setItem(
      savedDeliveryLocationKey,
      JSON.stringify({
        pincode,
        locationId: selectedLocation.id,
        area: selectedLocation.area,
        city: selectedLocation.city,
        deliveryFee: selectedLocation.deliveryFee,
      })
    );
  };

  const addConfiguredItem = (goToCart = false) => {
    if (pincode && availability !== "available") {
      toast.error("Please check delivery availability before adding this cake");
      return;
    }
    saveDeliveryLocation();
    addItem({
      id: Date.now(),
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: itemPrice,
      image: activeImage,
      slug: product.slug,
      quantity,
      message: cakeMessage.trim() || undefined,
      variantLabel: selectedWeight.label,
      deliveryPincode: pincode.trim() || undefined,
      deliveryArea: selectedLocation?.area,
      deliveryCity: selectedLocation?.city,
      addOns: selectedAddOnItems.map((addOn) => ({
        id: addOn.id,
        name: addOn.name,
        price: Number(addOn.price),
      })),
    });
    toast.success(`${product.name} added to cart`);
    if (goToCart) {
      navigate("/cart");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7F0] pb-20">
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-[#1A1A1A]/55">
          <Link to="/" className="hover:text-[#6B3A3A]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#6B3A3A]">Cake Delivery</Link>
          <span>/</span>
          <span className="font-medium text-[#F04423]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 xl:gap-10">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="grid gap-4 md:grid-cols-[96px_minmax(0,1fr)]">
              <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
                {gallery.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-white transition ${
                      activeImage === image
                        ? "border-[#F04423] ring-2 ring-[#F04423]/15"
                        : "border-[#6B3A3A]/10 hover:border-[#F04423]/50"
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                    {index === 1 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-xs font-semibold text-white">
                        Play
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="order-1 md:order-2">
                <div className="relative aspect-[1.04] overflow-hidden rounded-2xl bg-white shadow-sm">
                  {activeImage && (
                    <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
                  )}
                  <div className="absolute left-5 top-5 flex flex-col gap-2">
                    <span className="w-fit rounded-md bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                      EGGLESS
                    </span>
                    {product.isBestseller && (
                      <span className="w-fit rounded-md bg-[#FFD84A] px-3 py-1 text-xs font-bold text-[#1A1A1A] shadow-sm">
                        BEST SELLER
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <span className="absolute bottom-5 left-5 rounded-full bg-[#F04423] px-3 py-1.5 text-xs font-bold text-white">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {promiseCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-[#6B3A3A]/10 bg-white/75 p-4">
                  <card.icon className="mb-3 h-5 w-5 text-[#F04423]" />
                  <p className="text-sm font-semibold text-[#371F1A]">{card.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#1A1A1A]/55">{card.copy}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5"
          >
            <div className="sticky top-6 space-y-6">
              <div className="rounded-2xl border border-[#6B3A3A]/10 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#F04423]">
                      {product.category?.name ?? "Premium Cake"}
                    </p>
                    <h1 className="font-display text-3xl font-semibold leading-tight text-[#20110E] sm:text-4xl">
                      {product.name}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                        {product.rating}
                        <Star className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                      </span>
                      <span className="text-sm text-blue-600">
                        ({(product.reviewCount ?? 0).toLocaleString()} Reviews)
                      </span>
                      <span className="text-xs font-semibold text-[#1A1A1A]/45">
                        Inclusive of GST
                      </span>
                    </div>
                  </div>
                  <button className="rounded-full border border-[#6B3A3A]/10 p-3 text-[#371F1A] transition-colors hover:bg-[#FFF7F0]" aria-label="Wishlist">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5 flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#111]">
                    &#8377;{formatPrice(unitPrice)}
                  </span>
                  {product.compareAtPrice && (
                    <>
                      <span className="text-lg text-[#1A1A1A]/35 line-through">
                        &#8377;{Number(product.compareAtPrice).toLocaleString()}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {discount}% off
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#1A1A1A]/68">
                  {product.description}
                </p>

                <div className="mt-6 border-t border-[#6B3A3A]/10 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#111]">Select Weight</h2>
                    <span className="text-sm font-medium text-blue-600">Serving Info</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {weightOptions.map((weight) => (
                      <button
                        key={weight.label}
                        type="button"
                        onClick={() => setSelectedWeight(weight)}
                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                          selectedWeight.label === weight.label
                            ? "border-[#F04423] bg-[#FFF1EC] text-[#F04423]"
                            : "border-[#1A1A1A]/15 bg-white text-[#111] hover:border-[#F04423]/60"
                        }`}
                      >
                        {weight.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-[#1A1A1A]/55">{selectedWeight.serving}</p>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="cake-message" className="flex items-center gap-2 text-lg font-bold text-[#111]">
                      <MessageSquareText className="h-5 w-5 text-[#F04423]" />
                      Cake Message
                    </label>
                    <span className="text-sm text-[#1A1A1A]/45">{cakeMessage.length}/25</span>
                  </div>
                  <input
                    id="cake-message"
                    type="text"
                    value={cakeMessage}
                    onChange={(event) => setCakeMessage(event.target.value)}
                    placeholder="Write a sweet wish!"
                    maxLength={25}
                    className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#F04423] focus:ring-2 focus:ring-[#F04423]/12"
                  />
                </div>

                <div className="mt-6">
                  <label htmlFor="delivery-pincode" className="mb-2 block text-lg font-bold text-[#111]">
                    Delivery Location*
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F04423]" />
                      <input
                        id="delivery-pincode"
                        inputMode="numeric"
                        value={pincode}
                        onChange={(event) => {
                          setPincode(event.target.value.replace(/\D/g, "").slice(0, 6));
                          setLookupPincode("");
                          setSelectedLocationId(null);
                          setAvailability("idle");
                        }}
                        placeholder="Search area/locality/pincode"
                        className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#F04423] focus:ring-2 focus:ring-[#F04423]/12"
                      />
                    </div>
                    <Button type="button" onClick={checkAvailability} className="rounded-lg bg-[#F0041F] px-5 text-white hover:bg-[#d9041c]">
                      Check Availability
                    </Button>
                  </div>
                  <div className="mt-2 min-h-5 text-xs font-medium">
                    {availability === "available" && (
                      <span className="text-emerald-700">
                        Earliest Delivery: Today
                        {selectedLocation ? ` | ${selectedLocation.area}, ${selectedLocation.city}` : ""}
                      </span>
                    )}
                    {availability === "error" && (
                      <span className="text-[#F04423]">Delivery is not active for this pincode yet.</span>
                    )}
                    {availability === "idle" && (
                      <span className="text-[#F59E0B]">Available in limited cities*</span>
                    )}
                  </div>
                  {serviceableLocations.length > 1 && (
                    <div className="mt-3">
                      <label htmlFor="delivery-area" className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#1A1A1A]/45">
                        Select area for this pincode
                      </label>
                      <select
                        id="delivery-area"
                        value={selectedLocationId ?? ""}
                        onChange={(event) => setSelectedLocationId(Number(event.target.value))}
                        className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#F04423] focus:ring-2 focus:ring-[#F04423]/12"
                      >
                        {serviceableLocations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.area}, {location.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#6B3A3A]/10 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-[#6B3A3A]">
                      <Gift className="h-5 w-5 text-[#F04423]" />
                      Add-ons
                    </h2>
                    <p className="text-sm text-[#1A1A1A]/52">Upsell gifts before checkout.</p>
                  </div>
                  <span className="rounded-full bg-[#FFF1EC] px-3 py-1 text-xs font-bold text-[#F04423]">
                    +&#8377;{addOnTotal}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {addOnOptions.map((addOn) => {
                    const isSelected = selectedAddOns.includes(addOn.id);
                    return (
                      <button
                        key={addOn.id}
                        type="button"
                        onClick={() => toggleAddOn(addOn.id)}
                        className={`flex min-h-[108px] gap-3 rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? "border-[#F04423] bg-[#FFF7F0]"
                            : "border-[#6B3A3A]/10 bg-white hover:border-[#F04423]/45"
                        }`}
                      >
                        <img src={addOn.image} alt={addOn.name} className="h-16 w-16 rounded-lg object-cover" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm font-bold leading-5 text-[#23130F]">{addOn.name}</span>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              isSelected ? "border-[#F04423] bg-[#F04423] text-white" : "border-[#6B3A3A]/20 text-transparent"
                            }`}>
                              <Check className="h-3 w-3" />
                            </span>
                          </span>
                          <span className="mt-1 block text-xs leading-4 text-[#1A1A1A]/50">{addOn.description}</span>
                          <span className="mt-2 block text-sm font-bold text-[#F04423]">+&#8377;{Number(addOn.price).toLocaleString()}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-[#6B3A3A]/10 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center rounded-lg border border-[#1A1A1A]/15">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 transition-colors hover:bg-[#FFF7F0]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 transition-colors hover:bg-[#FFF7F0]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button
                      type="button"
                      onClick={() => addConfiguredItem(false)}
                      variant="outline"
                      className="h-12 rounded-lg border-[#F04423] text-[#F04423] hover:bg-[#FFF1EC]"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      type="button"
                      onClick={() => addConfiguredItem(true)}
                      className="h-12 rounded-lg bg-[#F0041F] text-base font-bold text-white hover:bg-[#d9041c]"
                    >
                      Buy Now | &#8377;{formatPrice(payableTotal)}
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#1A1A1A]/55">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#F04423]" />
                    Freshly baked after confirmation
                  </span>
                  <span>SKU: {product.sku}</span>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold text-[#6B3A3A]">Product Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#FFF7F0] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/45">Flavour</p>
                <p className="mt-1 font-semibold text-[#22110E]">{product.tags?.[1] ?? product.category?.name ?? "Chocolate"}</p>
              </div>
              <div className="rounded-xl bg-[#FFF7F0] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/45">SKU</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#22110E]">{product.sku}</p>
              </div>
              <div className="rounded-xl bg-[#FFF7F0] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/45">Weight range</p>
                <p className="mt-1 font-semibold text-[#22110E]">0.5 Kg to 4 Kg</p>
              </div>
              <div className="rounded-xl bg-[#FFF7F0] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/45">Storage</p>
                <p className="mt-1 font-semibold text-[#22110E]">Keep refrigerated, consume within 24 hours</p>
              </div>
              <div className="rounded-xl bg-[#FFF7F0] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/45">Delivery</p>
                <p className="mt-1 font-semibold text-[#22110E]">Same day, fixed time and midnight slots</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-[#2B1711] p-6 text-white shadow-sm">
            <h2 className="font-display text-2xl font-semibold">Offers Available</h2>
            <div className="mt-5 space-y-3">
              {["Flat 10% off above Rs.999", "Free candles on prepaid orders", "Corporate bulk orders supported"].map((offer) => (
                <div key={offer} className="flex gap-3 rounded-xl bg-white/10 p-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD84A]" />
                  <span>{offer}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {product.related && product.related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-3xl font-semibold text-[#6B3A3A]">
              Customers Also Viewed
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {product.related.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/shop/${relatedProduct.slug}`}
                  className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="aspect-square overflow-hidden bg-white">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold text-[#6B3A3A]">
                      {relatedProduct.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-semibold text-[#6B3A3A]">
                        &#8377;{Number(relatedProduct.price).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[#D4A373] text-[#D4A373]" />
                        <span className="text-xs text-[#1A1A1A]/60">{relatedProduct.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
