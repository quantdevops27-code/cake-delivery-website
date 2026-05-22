import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "sonner";

const statuses = ["all", "pending", "confirmed", "baking", "out_for_delivery", "delivered", "cancelled"];

export default function Orders() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.admin.getOrders.useQuery({
    status: status === "all" ? undefined : status,
    page,
    limit: 20,
  });

  const updateStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      refetch();
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-[#6B3A3A]">All Orders</h2>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-full border border-[#6B3A3A]/15 bg-white/80 text-sm">
            {statuses.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-6 w-6 border-2 border-[#6B3A3A] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <>
            <div className="bg-white/60 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#1A1A1A]/50 border-b border-[#6B3A3A]/10 bg-[#F8EDEB]/50">
                      <th className="px-4 py-3 font-medium">Order #</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Payment</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.map((order) => (
                      <tr key={order.id} className="border-b border-[#6B3A3A]/5 hover:bg-[#F8EDEB]/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-[#6B3A3A] text-xs">{order.orderNumber}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{order.deliveryName ?? "N/A"}</p>
                          <p className="text-xs text-[#1A1A1A]/50">{order.deliveryPhone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                            order.status === "delivered" ? "bg-green-100 text-green-700" : order.status === "cancelled" ? "bg-red-100 text-red-700" : order.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {(order.status ?? "").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs ${order.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">&#8377;{Number(order.total).toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#1A1A1A]/50">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</td>
                        <td className="px-4 py-3">
                          <Select value={order.status ?? undefined} onValueChange={(newStatus) => {
                            updateStatus.mutate({ id: order.id, status: newStatus as "pending" | "confirmed" | "baking" | "out_for_delivery" | "delivered" | "cancelled" });
                          }}>
                            <SelectTrigger className="w-36 h-8 text-xs" />
                            <SelectContent>
                              {statuses.filter((s) => s !== "all").map((s) => (
                                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${p === page ? "bg-[#6B3A3A] text-white" : "bg-white/80 border border-[#6B3A3A]/15"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
