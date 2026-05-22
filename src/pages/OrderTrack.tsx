import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Search, CheckCircle, ChefHat, Truck, Home, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

const statusSteps = [
  { status: "pending", label: "Order Confirmed", icon: CheckCircle },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "baking", label: "Being Prepared", icon: ChefHat },
  { status: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Home },
];

export default function OrderTrack() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searched, setSearched] = useState(false);

  const { data: order, isLoading } = trpc.order.track.useQuery(
    { orderNumber },
    { enabled: searched && orderNumber.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const getStepIndex = (status: string | null | undefined) => {
    if (!status) return -1;
    return statusSteps.findIndex((s) => s.status === status);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B3A3A] mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="font-display text-3xl font-semibold text-[#6B3A3A] mb-2">Track Your Order</h1>
        <p className="text-[#1A1A1A]/60 mb-8">Enter your order number to check the status</p>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input type="text" value={orderNumber} onChange={(e) => { setOrderNumber(e.target.value); setSearched(false); }} placeholder="e.g. VW-ABC123-XYZ"
            className="flex-1 px-5 py-3 rounded-full border border-[#6B3A3A]/15 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#6B3A3A]/20 text-sm" />
          <Button type="submit" className="bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full px-6">
            <Search className="h-4 w-4 mr-2" /> Track
          </Button>
        </form>

        {isLoading && (
          <div className="text-center py-10">
            <div className="animate-spin h-6 w-6 border-2 border-[#6B3A3A] border-t-transparent rounded-full mx-auto" />
          </div>
        )}

        {searched && !isLoading && !order && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 bg-white/60 rounded-2xl">
            <XCircle className="h-12 w-12 text-[#1A1A1A]/20 mx-auto mb-3" />
            <p className="text-[#6B3A3A] font-medium">Order not found</p>
            <p className="text-sm text-[#1A1A1A]/50 mt-1">Please check your order number and try again</p>
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white/60 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-wider">Order Number</p>
                  <p className="font-mono font-semibold text-[#6B3A3A]">{order.orderNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                  order.status === "delivered" ? "bg-green-100 text-green-700" : order.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-[#D4A373]/20 text-[#6B3A3A]"
                }`}>
                  {(order.status ?? "unknown").replace(/_/g, " ")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#1A1A1A]/50">Delivery Date</p>
                  <p className="text-[#6B3A3A] font-medium">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "Not scheduled"}</p>
                </div>
                <div>
                  <p className="text-[#1A1A1A]/50">Total</p>
                  <p className="text-[#6B3A3A] font-medium">&#8377;{Number(order.total).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {order.status !== "cancelled" && (
              <div className="bg-white/60 rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold text-[#6B3A3A] mb-6">Order Progress</h3>
                <div className="space-y-6">
                  {statusSteps.map((step, i) => {
                    const currentStep = getStepIndex(order.status);
                    const isActive = i <= currentStep;
                    const isCurrent = i === currentStep;
                    return (
                      <div key={step.status} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-[#6B3A3A]" : "bg-[#6B3A3A]/10"}`}>
                          <step.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-[#6B3A3A]/40"}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isActive ? "text-[#6B3A3A]" : "text-[#1A1A1A]/40"}`}>{step.label}</p>
                          {isCurrent && <p className="text-xs text-[#D4A373]">In progress</p>}
                        </div>
                        {isActive && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white/60 rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-[#6B3A3A] mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-[#6B3A3A]/5 last:border-0">
                    <img src={item.productImage ?? "/images/hero-cake.jpg"} alt={item.productName} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#6B3A3A]">{item.productName}</p>
                      <p className="text-xs text-[#1A1A1A]/50">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">&#8377;{(Number(item.price) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
