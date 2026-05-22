import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { CheckCircle, ChefHat, Clock, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="font-display text-3xl font-semibold text-[#6B3A3A] mb-3">
          Order Placed Successfully!
        </h1>
        <p className="text-[#1A1A1A]/60 mb-2">Thank you for choosing The Velvet Whisk.</p>
        <p className="text-sm text-[#1A1A1A]/50 mb-8">
          Your order number is:{" "}
          <span className="font-mono font-semibold text-[#6B3A3A]">{orderNumber}</span>
        </p>

        <div className="bg-white/60 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-display text-lg font-semibold text-[#6B3A3A] mb-4">
            What happens next?
          </h3>
          <div className="space-y-4">
            {[
              { icon: CheckCircle, title: "Order Confirmed", desc: "We've received your order", active: true },
              { icon: ChefHat, title: "Preparing", desc: "Our bakers are crafting your cake", active: false },
              { icon: Clock, title: "Quality Check", desc: "Final inspection before dispatch", active: false },
              { icon: Truck, title: "Out for Delivery", desc: "Your cake is on the way!", active: false },
            ].map((step) => (
              <div key={step.title} className={`flex items-center gap-4 ${step.active ? "opacity-100" : "opacity-50"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.active ? "bg-[#6B3A3A]" : "bg-[#6B3A3A]/10"}`}>
                  <step.icon className={`h-5 w-5 ${step.active ? "text-white" : "text-[#6B3A3A]"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#6B3A3A]">{step.title}</p>
                  {step.active && <p className="text-xs text-[#D4A373]">In progress</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="rounded-full border-[#6B3A3A] text-[#6B3A3A]">
            <Link to={`/track?order=${orderNumber}`}>Track Order</Link>
          </Button>
          <Button asChild className="bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
