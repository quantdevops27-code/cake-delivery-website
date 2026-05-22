import { Link } from "react-router";
import { motion } from "framer-motion";
import { Users, ShoppingBag, IndianRupee, Megaphone, ShoppingCart } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

export default function Dashboard() {
  const { data: stats } = trpc.crm.getDashboardStats.useQuery();
  const { data: orderStats } = trpc.admin.getStats.useQuery();
  const { data: analytics } = trpc.crm.getCustomerAnalytics.useQuery({ period: "30d" });

  const statCards = [
    { title: "Total Customers", value: stats?.totalCustomers ?? 0, icon: Users, color: "bg-blue-50 text-blue-600", link: "/admin/customers" },
    { title: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "bg-green-50 text-green-600", link: "/admin/orders" },
    { title: "Total Revenue", value: `Rs.${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: IndianRupee, color: "bg-amber-50 text-amber-600", link: "/admin/orders" },
    { title: "Active Campaigns", value: stats?.activeCampaigns ?? 0, icon: Megaphone, color: "bg-purple-50 text-purple-600", link: "/admin/campaigns" },
    { title: "Abandoned Carts", value: stats?.abandonedCarts ?? 0, icon: ShoppingCart, color: "bg-red-50 text-red-600", link: "/admin/customers" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((card, i) => (
            <motion.div key={card.title} custom={i} initial="hidden" animate="visible" variants={fadeIn}>
              <Link to={card.link} className="block bg-white/60 rounded-2xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-[#6B3A3A]">{card.value}</p>
                <p className="text-sm text-[#1A1A1A]/50 mt-1">{card.title}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {analytics && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/60 rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold text-[#6B3A3A] mb-5">30-Day Customer Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-[#F8EDEB] rounded-xl">
                <p className="text-3xl font-semibold text-[#6B3A3A]">{analytics.newCustomers}</p>
                <p className="text-sm text-[#1A1A1A]/50 mt-1">New Customers</p>
              </div>
              <div className="text-center p-4 bg-[#F8EDEB] rounded-xl">
                <p className="text-3xl font-semibold text-[#6B3A3A]">Rs.{analytics.revenue.toLocaleString()}</p>
                <p className="text-sm text-[#1A1A1A]/50 mt-1">Revenue</p>
              </div>
              <div className="text-center p-4 bg-[#F8EDEB] rounded-xl">
                <p className="text-3xl font-semibold text-[#6B3A3A]">{analytics.totalOrders}</p>
                <p className="text-sm text-[#1A1A1A]/50 mt-1">Orders</p>
              </div>
              <div className="text-center p-4 bg-[#F8EDEB] rounded-xl">
                <p className="text-3xl font-semibold text-[#6B3A3A]">{analytics.repeatRate}%</p>
                <p className="text-sm text-[#1A1A1A]/50 mt-1">Repeat Rate</p>
              </div>
            </div>
          </motion.div>
        )}

        {orderStats?.recentOrders && orderStats.recentOrders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-[#6B3A3A]">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-[#D4A373] hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#1A1A1A]/50 border-b border-[#6B3A3A]/10">
                    <th className="pb-3 font-medium">Order #</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orderStats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#6B3A3A]/5 last:border-0">
                      <td className="py-3 font-mono text-[#6B3A3A] text-xs">{order.orderNumber}</td>
                      <td className="py-3">{order.deliveryName ?? "N/A"}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                          order.status === "delivered" ? "bg-green-100 text-green-700" : order.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {(order.status ?? "").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 font-semibold">&#8377;{Number(order.total).toLocaleString()}</td>
                      <td className="py-3 text-[#1A1A1A]/50">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {orderStats?.statusBreakdown && orderStats.statusBreakdown.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/60 rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold text-[#6B3A3A] mb-5">Order Status Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {orderStats.statusBreakdown.map((s) => (
                <div key={s.status ?? "unknown"} className="text-center p-4 bg-[#F8EDEB] rounded-xl">
                  <p className="text-2xl font-semibold text-[#6B3A3A]">{s.count}</p>
                  <p className="text-xs text-[#1A1A1A]/50 mt-1 uppercase">{(s.status ?? "").replace(/_/g, " ")}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
