import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

const deliverySlots = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
  "8:00 PM - 10:00 PM",
  "11:00 PM - 12:00 AM (Midnight)",
];

type CheckoutUser = {
  name: string;
  phone: string;
  email: string;
  method: "mobile" | "google";
};

const savedUserKey = "bakerush-checkout-user";
const savedDeliveryLocationKey = "bakerush-delivery-location";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(2);
  const [checkoutUser, setCheckoutUser] = useState<CheckoutUser | null>(null);
  const [locationLocked, setLocationLocked] = useState(false);
  const [form, setForm] = useState({
    receiverName: "",
    receiverPhone: "",
    alternatePhone: "",
    apartment: "",
    area: "",
    city: "",
    pincode: "",
    addressType: "Home",
    date: "",
    time: "",
    instructions: "",
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(savedUserKey);
    const savedLocation = window.localStorage.getItem(savedDeliveryLocationKey);
    const cartDelivery = items.find((item) => item.deliveryPincode);

    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation) as {
          pincode?: string;
          area?: string;
          city?: string;
        };
        if (parsedLocation.pincode || parsedLocation.area || parsedLocation.city) {
          setLocationLocked(true);
          setForm((current) => ({
            ...current,
            pincode: current.pincode || parsedLocation.pincode || "",
            area: current.area || parsedLocation.area || "",
            city: current.city || parsedLocation.city || "",
          }));
        }
      } catch {
        window.localStorage.removeItem(savedDeliveryLocationKey);
      }
    } else if (cartDelivery) {
      setLocationLocked(true);
      setForm((current) => ({
        ...current,
        pincode: current.pincode || cartDelivery.deliveryPincode || "",
        area: current.area || cartDelivery.deliveryArea || "",
        city: current.city || cartDelivery.deliveryCity || "",
      }));
    }

    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as CheckoutUser;
      if (parsed.name === "Mobile Customer" || parsed.name === "Google Customer") {
        window.localStorage.removeItem(savedUserKey);
        navigate("/cart?login=1", { replace: true });
        return;
      }
      setCheckoutUser(parsed);
      setStep(2);
      setForm((current) => ({
        ...current,
        receiverName: current.receiverName || parsed.name,
        receiverPhone: current.receiverPhone || parsed.phone,
      }));
    } catch {
      window.localStorage.removeItem(savedUserKey);
      navigate("/cart?login=1", { replace: true });
    }
  }, [items, navigate]);

  useEffect(() => {
    if (items.length > 0 && !window.localStorage.getItem(savedUserKey)) {
      toast.error("Please login before checkout");
      navigate("/cart?login=1", { replace: true });
    }
  }, [items.length, navigate]);

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order-success?order=${data.orderNumber}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deliveryFee = getTotal() >= 999 ? 0 : 49;
  const total = getTotal() + deliveryFee;
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 font-display text-2xl text-[#6B3A3A]">Your cart is empty</h2>
          <Button className="rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90" onClick={() => navigate("/shop")}>
            Browse Cakes
          </Button>
        </div>
      </div>
    );
  }

  const validateAddress = () => {
    if (!form.receiverName || !form.receiverPhone || !form.apartment || !form.area || !form.city || !form.pincode) {
      toast.error("Please fill receiver and delivery address details");
      return false;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error("Enter valid 6 digit pincode");
      return false;
    }
    return true;
  };

  const validateSchedule = () => {
    if (!form.date || !form.time) {
      toast.error("Please select delivery date and time slot");
      return false;
    }
    return true;
  };

  const placeOrder = () => {
    if (!checkoutUser) {
      toast.error("Please login before checkout");
      setStep(1);
      return;
    }
    if (!validateAddress() || !validateSchedule()) return;

    createOrder.mutate({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productSku: item.sku,
        productName: [
          item.name,
          item.sku ? `SKU: ${item.sku}` : "",
          item.variantLabel ? `Size: ${item.variantLabel}` : "",
          item.message ? `Cake message: ${item.message}` : "",
          item.addOns?.length ? `Add-ons: ${item.addOns.map((addOn) => addOn.name).join(", ")}` : "",
        ].filter(Boolean).join(" | "),
        productImage: item.image,
        message: item.message,
      })),
      deliveryDetails: {
        name: form.receiverName,
        phone: form.receiverPhone,
        address: `${form.apartment}, ${form.area} (${form.addressType})`,
        city: form.city,
        pincode: form.pincode,
        date: form.date,
        time: form.time,
        specialInstructions: [
          form.alternatePhone ? `Alternate phone: ${form.alternatePhone}` : "",
          form.instructions,
        ].filter(Boolean).join(" | "),
      },
      deliveryFee,
      discount: 0,
    });
  };

  const inputClass = "w-full rounded-xl border border-[#d9d9d9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#F0041F] focus:ring-2 focus:ring-[#F0041F]/10";

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20">
      <div className="bg-[#F0041F] text-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </button>
          <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> 100% Payment Protection</span>
            <span>Fresh delivery promise</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-5">
          <StepCard step={1} active={false} done={Boolean(checkoutUser)} title="Login Details" icon={LockKeyhole} onClick={() => navigate("/cart?login=1")}>
            {checkoutUser && (
              <div className="mt-3 grid gap-1 text-xs text-[#1A1A1A]/65">
                <span>Name: {checkoutUser.name}</span>
                <span>Phone: {checkoutUser.phone || "Not added"}</span>
                <span>Email: {checkoutUser.email || "Not added"}</span>
              </div>
            )}
          </StepCard>
          <StepCard step={2} active={step === 2} done={validateAddressSilently(form)} title="Delivery Address" icon={MapPin} onClick={() => checkoutUser && setStep(2)} />
          <StepCard step={3} active={step === 3} done={Boolean(form.date && form.time)} title="Delivery Date & Time" icon={Calendar} onClick={() => checkoutUser && validateAddress() && setStep(3)} />
          <StepCard step={4} active={step === 4} done={false} title="Review Order" icon={CreditCard} onClick={() => checkoutUser && validateAddress() && validateSchedule() && setStep(4)} />
        </aside>

        <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0">
            {step === 2 && (
              <Panel title="Let us know where to deliver" subtitle="Receiver details are required above the delivery address.">
                <div className="grid gap-4">
                  <Field label="Receiver Name *">
                    <input value={form.receiverName} onChange={(event) => setForm({ ...form, receiverName: event.target.value })} className={inputClass} placeholder="Mr. Aman" />
                  </Field>
                  <Field label="Apartment / House No. / Floor *">
                    <input value={form.apartment} onChange={(event) => setForm({ ...form, apartment: event.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Area / Locality *">
                    <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} readOnly={locationLocked} className={`${inputClass} ${locationLocked ? "bg-[#f5f5f5] text-[#555]" : ""}`} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="PinCode *">
                      <input value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value.replace(/\D/g, "").slice(0, 6) })} readOnly={locationLocked} className={`${inputClass} ${locationLocked ? "bg-[#f5f5f5] text-[#555]" : ""}`} />
                    </Field>
                    <Field label="Delivery City *">
                      <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} readOnly={locationLocked} className={`${inputClass} ${locationLocked ? "bg-[#f5f5f5] text-[#555]" : ""}`} />
                    </Field>
                  </div>
                  {locationLocked && (
                    <p className="rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                      Delivery area, city and pincode are locked from product page availability check.
                    </p>
                  )}
                  <Field label="Receiver Number *">
                    <input value={form.receiverPhone} onChange={(event) => setForm({ ...form, receiverPhone: event.target.value.replace(/\D/g, "").slice(0, 10) })} className={inputClass} />
                  </Field>
                  <Field label="Alternate Phone Number">
                    <input value={form.alternatePhone} onChange={(event) => setForm({ ...form, alternatePhone: event.target.value.replace(/\D/g, "").slice(0, 10) })} className={inputClass} />
                  </Field>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#111]">Address Type *</p>
                    <div className="flex flex-wrap gap-2">
                      {["Home", "Office", "Others"].map((type) => (
                        <button key={type} type="button" onClick={() => setForm({ ...form, addressType: type })} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${form.addressType === type ? "border-[#F0041F] bg-[#F0041F] text-white" : "border-[#d9d9d9] bg-white text-[#111]"}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="button" onClick={() => validateAddress() && setStep(3)} className="h-12 rounded-xl bg-[#F0041F] text-white hover:bg-[#d9041c]">
                    Continue
                  </Button>
                </div>
              </Panel>
            )}

            {step === 3 && (
              <Panel title="Choose delivery date & time" subtitle="Select the exact delivery slot before reviewing the order.">
                <div className="grid gap-4">
                  <Field label="Delivery Date *">
                    <input type="date" value={form.date} min={today} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Time Slot *">
                    <select value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className={inputClass}>
                      <option value="">Select time slot</option>
                      {deliverySlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                  </Field>
                  <Field label="Special Instructions">
                    <textarea rows={4} value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} className={inputClass} placeholder="Any special request for delivery..." />
                  </Field>
                  <Button type="button" onClick={() => validateSchedule() && setStep(4)} className="h-12 rounded-xl bg-[#F0041F] text-white hover:bg-[#d9041c]">
                    Continue to Review
                  </Button>
                </div>
              </Panel>
            )}

            {step === 4 && (
              <Panel title="Review Order" subtitle="Confirm receiver, address, slot and order items.">
                <div className="grid gap-4">
                  <ReviewBlock title="Login Details" lines={[checkoutUser?.name ?? "", checkoutUser?.phone ? `Mobile: ${checkoutUser.phone}` : "", checkoutUser?.email ? `Email: ${checkoutUser.email}` : "Email: Not added"]} onEdit={() => navigate("/cart?login=1")} />
                  <ReviewBlock title="Delivery Address" lines={[form.receiverName, form.receiverPhone, `${form.apartment}, ${form.area}`, `${form.city} - ${form.pincode}`, form.addressType]} onEdit={() => setStep(2)} />
                  <ReviewBlock title="Delivery Slot" lines={[form.date, form.time]} onEdit={() => setStep(3)} />
                  <ReviewBlock
                    title="Cake Messages"
                    lines={items
                      .filter((item) => item.message)
                      .map((item) => `${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}: ${item.message}`)}
                    onEdit={() => navigate("/cart")}
                  />
                  <Button type="button" disabled={createOrder.isPending} onClick={placeOrder} className="h-12 rounded-xl bg-[#F0041F] text-white hover:bg-[#d9041c]">
                    {createOrder.isPending ? "Placing Order..." : `Place Order | Rs.${total.toLocaleString()}`}
                  </Button>
                </div>
              </Panel>
            )}
          </section>

          <OrderSummary items={items} subtotal={getTotal()} deliveryFee={deliveryFee} total={total} />
        </main>
      </div>
    </div>
  );
}

function validateAddressSilently(form: {
  receiverName: string;
  receiverPhone: string;
  apartment: string;
  area: string;
  city: string;
  pincode: string;
}) {
  return Boolean(form.receiverName && form.receiverPhone && form.apartment && form.area && form.city && form.pincode);
}

function StepCard({
  step,
  title,
  active,
  done,
  icon: Icon,
  children,
  onClick,
}: {
  step: number;
  title: string;
  active: boolean;
  done: boolean;
  icon: typeof LockKeyhole;
  children?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={`w-full rounded-lg bg-white p-5 text-left shadow-sm transition ${active ? "ring-2 ring-[#F0041F]" : "hover:shadow-md"}`}>
      <div className="flex items-center gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-xl ${active ? "bg-[#fff0f2] text-[#F0041F]" : done ? "bg-emerald-50 text-emerald-700" : "bg-[#f4f4f4] text-[#999]"}`}>
          {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </span>
        <span>
          <span className="block text-sm text-[#1A1A1A]/55">Step {step}</span>
          <span className={`block text-lg font-bold ${active ? "text-[#111]" : "text-[#777]"}`}>{title}</span>
        </span>
      </div>
      {children}
    </button>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#111]">{title}</h1>
      <p className="mt-2 text-sm text-[#1A1A1A]/55">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#1A1A1A]/70">
      {label}
      {children}
    </label>
  );
}

function ReviewBlock({ title, lines, onEdit }: { title: string; lines: string[]; onEdit: () => void }) {
  return (
    <div className="rounded-xl border border-[#e3e3e3] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-[#111]">{title}</h2>
          <div className="mt-2 grid gap-1 text-sm text-[#1A1A1A]/65">
            {lines.filter(Boolean).map((line) => <span key={line}>{line}</span>)}
          </div>
        </div>
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-[#F0041F] hover:underline">
          Edit
        </button>
      </div>
    </div>
  );
}

function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  total,
}: {
  items: ReturnType<typeof useCartStore.getState>["items"];
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  return (
    <aside className="h-fit rounded-lg bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <h2 className="mb-5 font-display text-xl font-semibold text-[#6B3A3A]">Order Summary</h2>
      <div className="max-h-72 space-y-3 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 border-b border-[#eee] pb-3 last:border-0">
            <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#111]">{item.name}</p>
              <p className="text-xs text-[#1A1A1A]/50">Qty {item.quantity}{item.sku ? ` | SKU ${item.sku}` : ""}</p>
              {item.message && <p className="text-xs text-[#1A1A1A]/50">Message: {item.message}</p>}
            </div>
            <span className="text-sm font-bold">Rs.{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2 border-t border-[#eee] pt-4 text-sm">
        <div className="flex justify-between text-[#1A1A1A]/65"><span>Subtotal</span><span>Rs.{subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-[#1A1A1A]/65"><span>Delivery</span><span>{deliveryFee === 0 ? "Free" : `Rs.${deliveryFee}`}</span></div>
        <div className="flex justify-between border-t border-[#eee] pt-3 text-lg font-bold text-[#111]"><span>Total</span><span>Rs.{total.toLocaleString()}</span></div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-[#1A1A1A]/45"><UserRound className="h-3.5 w-3.5" /> Login required before placing order</p>
    </aside>
  );
}
