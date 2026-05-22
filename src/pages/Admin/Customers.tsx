import { useState } from "react";
import { Search, Users } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

  const { data: customersData, isLoading } = trpc.crm.getCustomers.useQuery({
    search: search || undefined,
    page,
    limit: 20,
  });

  const { data: customerDetail } = trpc.crm.getCustomerDetail.useQuery(
    { userId: selectedCustomer ?? 0 },
    { enabled: !!selectedCustomer }
  );

  const { data: segments } = trpc.crm.getCustomerSegments.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#6B3A3A]">Customer CRM</h2>
            <p className="text-sm text-[#1A1A1A]/50">Manage customers, view profiles, and analyze behavior</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A1A1A]/40" />
            <input type="text" placeholder="Search customers..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 rounded-full border border-[#6B3A3A]/15 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3A3A]/20" />
          </div>
        </div>

        {segments && segments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {segments.map((seg) => (
              <div key={seg.id} className="bg-white/60 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: (seg.color ?? "#6B3A3A") + "20" }}>
                  <Users className="h-5 w-5" style={{ color: seg.color ?? "#6B3A3A" }} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#6B3A3A]">{seg.memberCount}</p>
                  <p className="text-xs text-[#1A1A1A]/50">{seg.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

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
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Orders</th>
                      <th className="px-4 py-3 font-medium">Total Spent</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersData?.items.map((customer) => (
                      <tr key={customer.id} className="border-b border-[#6B3A3A]/5 hover:bg-[#F8EDEB]/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {customer.avatar ? (
                              <img src={customer.avatar} alt={customer.name ?? ""} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#6B3A3A] text-white flex items-center justify-center text-xs font-medium">
                                {customer.name?.charAt(0)?.toUpperCase() ?? "U"}
                              </div>
                            )}
                            <p className="font-medium text-[#6B3A3A]">{customer.name ?? "Anonymous"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#1A1A1A]/50">{customer.email}</p>
                          <p className="text-xs text-[#1A1A1A]/50">{customer.phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">{customer.totalOrders} orders</span>
                        </td>
                        <td className="px-4 py-3 font-semibold">&#8377;{customer.totalSpent.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#1A1A1A]/50">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}</td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setSelectedCustomer(customer.id)}>
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {customersData && customersData.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: customersData.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${p === page ? "bg-[#6B3A3A] text-white" : "bg-white/80 border border-[#6B3A3A]/15"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-[#6B3A3A]">Customer Details</DialogTitle>
            </DialogHeader>
            {customerDetail && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {customerDetail.avatar ? (
                    <img src={customerDetail.avatar} alt={customerDetail.name ?? ""} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#6B3A3A] text-white flex items-center justify-center text-xl font-medium">
                      {customerDetail.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[#6B3A3A]">{customerDetail.name ?? "Anonymous"}</h3>
                    <p className="text-sm text-[#1A1A1A]/50">{customerDetail.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-[#F8EDEB] rounded-xl">
                    <p className="text-xl font-semibold text-[#6B3A3A]">{customerDetail.totalOrders}</p>
                    <p className="text-xs text-[#1A1A1A]/50">Orders</p>
                  </div>
                  <div className="text-center p-3 bg-[#F8EDEB] rounded-xl">
                    <p className="text-xl font-semibold text-[#6B3A3A]">&#8377;{customerDetail.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-[#1A1A1A]/50">Spent</p>
                  </div>
                  <div className="text-center p-3 bg-[#F8EDEB] rounded-xl">
                    <p className="text-xl font-semibold text-[#6B3A3A]">{customerDetail.phone ?? "N/A"}</p>
                    <p className="text-xs text-[#1A1A1A]/50">Phone</p>
                  </div>
                </div>

                {customerDetail.orders && customerDetail.orders.length > 0 && (
                  <div>
                    <h4 className="font-display text-md font-semibold text-[#6B3A3A] mb-3">Order History</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {customerDetail.orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-[#F8EDEB] rounded-lg text-sm">
                          <div>
                            <p className="font-mono text-xs text-[#6B3A3A]">{order.orderNumber}</p>
                            <p className="text-xs text-[#1A1A1A]/50">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#6B3A3A]">&#8377;{Number(order.total).toLocaleString()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                              {(order.status ?? "").replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
