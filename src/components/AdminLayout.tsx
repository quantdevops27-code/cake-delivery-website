import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Gift,
  Users,
  MapPinned,
  PartyPopper,
  PieChart,
  Megaphone,
  ArrowLeft,
  Images,
  FolderTree,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { canAccessModule, type AdminModule } from "@contracts/admin-permissions";

const navItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard, hint: "Store overview", module: "dashboard" },
  { name: "Users", path: "/admin/users", icon: UserCog, hint: "Access & roles", module: "users" },
  { name: "Hero", path: "/admin/hero", icon: Images, hint: "Homepage banner", module: "hero" },
  { name: "Collections", path: "/admin/collections", icon: FolderTree, hint: "Category hierarchy", module: "collections" },
  { name: "Orders", path: "/admin/orders", icon: ShoppingBag, hint: "Fulfilment queue", module: "orders" },
  { name: "Products", path: "/admin/products", icon: Package, hint: "Catalog & inventory", module: "products" },
  { name: "Add-ons", path: "/admin/add-ons", icon: Gift, hint: "Upsell markup", module: "addons" },
  { name: "Locations", path: "/admin/locations", icon: MapPinned, hint: "Pincode delivery", module: "locations" },
  { name: "Occasions", path: "/admin/occasions", icon: PartyPopper, hint: "Events & festivals", module: "occasions" },
  { name: "Customers", path: "/admin/customers", icon: Users, hint: "CRM profiles", module: "customers" },
  { name: "Segments", path: "/admin/segments", icon: PieChart, hint: "Audience rules", module: "segments" },
  { name: "Campaigns", path: "/admin/campaigns", icon: Megaphone, hint: "Offers & messages", module: "campaigns" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const allowedNavItems = user
    ? navItems.filter((item) => canAccessModule(user.role, user.permissions, item.module as AdminModule))
    : [];
  const activeItem =
    allowedNavItems.find((item) => item.path === location.pathname) ??
    allowedNavItems[0] ??
    navItems[0];

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate("/");
      return;
    }
    const requested = navItems.find((item) => item.path === location.pathname);
    if (requested && !canAccessModule(user.role, user.permissions, requested.module as AdminModule)) {
      const firstAllowed = navItems.find((item) => canAccessModule(user.role, user.permissions, item.module as AdminModule));
      navigate(firstAllowed?.path ?? "/");
    }
  }, [user, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#6B3A3A] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || allowedNavItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8EDEB]">
      <div className="mx-auto flex max-w-[1500px] gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <aside className="hidden w-60 shrink-0 md:block xl:w-72">
          <div className="sticky top-6 rounded-2xl border border-[#6B3A3A]/10 bg-white/75 p-3 shadow-sm backdrop-blur">
            <Link
              to="/"
              className="mb-4 flex items-center gap-3 rounded-xl px-3 py-3 text-[#6B3A3A] transition-colors hover:bg-[#6B3A3A]/8"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B3A3A] text-white">
                <ArrowLeft className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#6B3A3A]/55">
                  Back to store
                </span>
                <span className="block text-sm font-semibold">BakeRush admin</span>
              </span>
            </Link>

            <div className="mb-3 px-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B3A3A]/45">
                Commerce Modules
              </p>
            </div>

            <nav className="space-y-1">
              {allowedNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                      isActive
                        ? "bg-[#6B3A3A] text-white shadow-sm"
                        : "text-[#6B3A3A] hover:bg-[#6B3A3A]/8"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? "bg-white/15" : "bg-[#6B3A3A]/8"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold leading-5">{item.name}</span>
                      <span
                        className={`block truncate text-xs leading-5 ${
                          isActive ? "text-white/70" : "text-[#1A1A1A]/45"
                        }`}
                      >
                        {item.hint}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B3A3A]/50">
                Admin Dashboard
              </p>
              <h1 className="font-display text-2xl font-semibold text-[#6B3A3A] sm:text-3xl">
                {activeItem.name}
              </h1>
              <p className="mt-1 text-sm text-[#1A1A1A]/50">
                {activeItem.hint}
              </p>
            </div>
            <Link
              to="/"
              className="hidden rounded-full border border-[#6B3A3A]/15 bg-white/70 px-4 py-2 text-sm font-semibold text-[#6B3A3A] transition-colors hover:bg-white md:inline-flex"
            >
              Storefront
            </Link>
          </div>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 md:hidden">
            {allowedNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#6B3A3A] text-white"
                      : "bg-white/70 text-[#6B3A3A] hover:bg-white"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
