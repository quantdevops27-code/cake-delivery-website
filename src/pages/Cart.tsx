import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, X, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";

const TEST_OTP = "123456";
const savedUserKey = "bakerush-checkout-user";

type CheckoutUser = {
  name: string;
  phone: string;
  email: string;
  method: "mobile" | "google";
};

function getSavedCheckoutUser() {
  const saved = window.localStorage.getItem(savedUserKey);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as CheckoutUser;
    if (!parsed.name || parsed.name === "Mobile Customer" || parsed.name === "Google Customer") {
      window.localStorage.removeItem(savedUserKey);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(savedUserKey);
    return null;
  }
}

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } =
    useCartStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loginOpen, setLoginOpen] = useState(false);
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const deliveryFee = getTotal() >= 999 ? 0 : 49;
  const total = getTotal() + deliveryFee;
  const inputClass = "w-full rounded-xl border border-[#d9d9d9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#F0041F] focus:ring-2 focus:ring-[#F0041F]/10";

  useEffect(() => {
    if (searchParams.get("login") === "1") {
      setLoginOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const proceedToCheckout = () => {
    if (getSavedCheckoutUser()) {
      navigate("/checkout");
      return;
    }
    setLoginOpen(true);
  };

  const saveCheckoutUser = (user: CheckoutUser) => {
    window.localStorage.setItem(savedUserKey, JSON.stringify(user));
    setLoginOpen(false);
    toast.success("Login completed. Continue checkout.");
    navigate("/checkout");
  };

  const sendOtp = () => {
    if (!customerNameInput.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phoneInput)) {
      toast.error("Enter valid 10 digit mobile number");
      return;
    }
    setOtpSent(true);
    toast.success("Test OTP sent. Use 123456");
  };

  const verifyOtp = () => {
    if (otpInput !== TEST_OTP) {
      toast.error("Invalid OTP. Test OTP is 123456");
      return;
    }
    saveCheckoutUser({
      name: customerNameInput.trim(),
      phone: phoneInput,
      email: emailInput.trim(),
      method: "mobile",
    });
  };

  const continueWithGoogle = () => {
    if (!customerNameInput.trim()) {
      toast.error("Enter customer name before Google sign-in demo");
      return;
    }
    if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      toast.error("Enter email for Google sign-in demo");
      return;
    }
    saveCheckoutUser({
      name: customerNameInput.trim(),
      phone: phoneInput,
      email: emailInput.trim(),
      method: "google",
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-[#6B3A3A]/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-[#6B3A3A] mb-2">
            Your cart is empty
          </h2>
          <p className="text-[#1A1A1A]/50 mb-6">
            Looks like you haven&apos;t added any cakes yet.
          </p>
          <Button
            asChild
            className="bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full px-8"
          >
            <Link to="/shop">Browse Cakes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-semibold text-[#6B3A3A] mb-8">
          Shopping Cart ({items.length})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 bg-white/60 rounded-2xl p-4"
              >
                <Link to={`/shop/${item.slug}`} className="shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-white">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/shop/${item.slug}`}>
                        <h3 className="font-display text-lg font-semibold text-[#6B3A3A] truncate">
                          {item.name}
                        </h3>
                      </Link>
                      {item.message && (
                        <p className="text-xs text-[#1A1A1A]/50 mt-0.5">
                          Cake message: {item.message}
                        </p>
                      )}
                      {item.variantLabel && (
                        <p className="text-xs text-[#1A1A1A]/50 mt-0.5">
                          Size: {item.variantLabel}
                        </p>
                      )}
                      {item.sku && (
                        <p className="text-xs text-[#1A1A1A]/50 mt-0.5">
                          SKU: {item.sku}
                        </p>
                      )}
                      {item.addOns && item.addOns.length > 0 && (
                        <p className="text-xs text-[#1A1A1A]/50 mt-0.5">
                          Add-ons: {item.addOns.map((addOn) => addOn.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-[#1A1A1A]/30 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-[#6B3A3A]/15 rounded-full">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-2 hover:bg-[#6B3A3A]/5 rounded-l-full transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2 hover:bg-[#6B3A3A]/5 rounded-r-full transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-[#6B3A3A] font-semibold">
                      &#8377;{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Clear all items
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 rounded-2xl p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold text-[#6B3A3A] mb-5">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#1A1A1A]/70">
                  <span>Subtotal</span>
                  <span>&#8377;{getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#1A1A1A]/70">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>&#8377;{deliveryFee}</span>
                  )}
                </div>
                <div className="border-t border-[#6B3A3A]/10 pt-3 flex justify-between font-semibold text-[#6B3A3A]">
                  <span>Total</span>
                  <span>&#8377;{total.toLocaleString()}</span>
                </div>
              </div>
              {getTotal() < 999 && (
                <p className="text-xs text-[#D4A373] mt-3">
                  Add &#8377;{(999 - getTotal()).toLocaleString()} more for free
                  delivery!
                </p>
              )}
              <Button
                onClick={proceedToCheckout}
                className="w-full mt-6 bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full"
                size="lg"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full mt-2 text-[#6B3A3A]"
              >
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {loginOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 bg-[#fff7f0] p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F0041F]">Login / Signup</p>
                <h2 className="mt-1 text-2xl font-bold text-[#2f1b14]">Continue to checkout</h2>
                <p className="mt-1 text-sm text-[#1A1A1A]/55">Sign in once, then address and delivery slot will continue step by step.</p>
              </div>
              <button type="button" onClick={() => setLoginOpen(false)} className="rounded-full p-2 text-[#1A1A1A]/45 hover:bg-white hover:text-[#1A1A1A]" aria-label="Close login popup">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-5">
              <label className="grid gap-1.5 text-sm font-semibold text-[#1A1A1A]/70">
                Customer Name *
                <input value={customerNameInput} onChange={(event) => setCustomerNameInput(event.target.value)} className={inputClass} placeholder="Enter customer name" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-[#1A1A1A]/70">
                  Email
                  <input value={emailInput} onChange={(event) => setEmailInput(event.target.value)} className={inputClass} placeholder="customer@email.com" />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold text-[#1A1A1A]/70">
                  Mobile Number *
                  <input value={phoneInput} onChange={(event) => setPhoneInput(event.target.value.replace(/\D/g, "").slice(0, 10))} className={inputClass} placeholder="Enter mobile number" />
                </label>
              </div>

              <Button type="button" onClick={continueWithGoogle} className="h-12 rounded-xl bg-white text-[#1A1A1A] shadow-sm ring-1 ring-[#d9d9d9] hover:bg-[#f8f8f8]">
                <span className="mr-2 grid h-6 w-6 place-items-center rounded-full bg-[#4285F4] text-xs font-bold text-white">G</span>
                Sign in with Google
              </Button>

              <div className="text-center text-xs font-bold uppercase tracking-[0.18em] text-[#1A1A1A]/35">or mobile OTP</div>

              <Button type="button" onClick={sendOtp} className="h-12 rounded-xl bg-[#F0041F] px-7 text-white hover:bg-[#d9041c]">
                <Phone className="mr-2 h-4 w-4" />
                Send OTP to {phoneInput || "mobile number"}
              </Button>

              {otpSent && (
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input value={otpInput} onChange={(event) => setOtpInput(event.target.value.replace(/\D/g, "").slice(0, 6))} className={inputClass} placeholder="Enter OTP 123456" />
                  <Button type="button" onClick={verifyOtp} className="h-12 rounded-xl bg-[#2f241d] px-7 text-white hover:bg-[#463428]">
                    Verify & Continue
                  </Button>
                </div>
              )}

              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Test OTP is 123456. Real SMS and Google OAuth credentials can be connected later.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
