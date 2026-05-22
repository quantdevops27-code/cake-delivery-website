import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router";
import {
  ChevronDown,
  Gift,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navGroups = [
  {
    name: "Cakes",
    path: "/shop",
    promoImage: "/images/cake-truffle.jpg",
    columns: [
      { title: "Trending Cakes", items: [{ id: 1, name: "Chocolate Cakes", slug: "chocolate", path: "/shop?search=chocolate", badge: null }] },
      { title: "By Type", items: [{ id: 2, name: "Eggless Cakes", slug: "eggless", path: "/shop?search=eggless", badge: null }] },
    ],
  },
  {
    name: "Theme Cakes",
    path: "/shop?category=designer",
    promoImage: "/images/cake-floral.jpg",
    columns: [
      { title: "Kids Cakes", items: [{ id: 3, name: "1st Birthday Cakes", slug: "first-birthday", path: "/shop?search=1st+birthday", badge: null }] },
      { title: "Character Cakes", items: [{ id: 4, name: "Unicorn Cakes", slug: "unicorn", path: "/shop?search=unicorn", badge: null }] },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const cartCount = useCartStore((s) => s.getCount());
  const { user, isAuthenticated, logout } = useAuth();
  const { data: collectionMenus } = trpc.commerce.listCollectionMenus.useQuery();
  const menus = collectionMenus?.length ? collectionMenus : navGroups;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      window.location.href = `/shop?search=${encodeURIComponent(query)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7d8c9] bg-[#fffaf4]/95 backdrop-blur-xl">
      <div className="bg-[#2f241d] text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
          <button className="flex items-center gap-2 text-white/90">
            <MapPin className="h-3.5 w-3.5 text-[#ffb347]" />
            Delivering to <span className="font-semibold text-white">Select City</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <div className="hidden items-center gap-5 text-white/80 md:flex">
            <Link to="/track" className="hover:text-white">Track Order</Link>
            <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Same day delivery</span>
            <span className="flex items-center gap-1"><Gift className="h-3.5 w-3.5" /> Fresh offers daily</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[74px] items-center gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-[#7a3f2b] text-xl font-black text-white shadow-sm">
              B
            </span>
            <span className="leading-tight">
              <span className="block text-2xl font-black text-[#312018]">BakeRush</span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a65c36]">
                cakes in minutes
              </span>
            </span>
          </Link>

          <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7465]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search cakes, flavours, occasions..."
                className="h-12 w-full rounded-md border border-[#e3d3c5] bg-white pl-11 pr-4 text-sm text-[#312018] outline-none transition focus:border-[#b96339] focus:ring-2 focus:ring-[#f3c8a2]"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link to="/track" className="hidden rounded-md px-3 py-2 text-sm font-semibold text-[#5f4031] hover:bg-[#f4e8dd] lg:block">
              Track
            </Link>
            <Link to="/cart" className="relative rounded-md p-2.5 text-[#5f4031] hover:bg-[#f4e8dd]" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-[#e5522d] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-md p-2 text-[#5f4031] hover:bg-[#f4e8dd]">
                    <UserRound className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="border-b px-3 py-2">
                    <p className="text-sm font-medium">{user?.name ?? "Customer"}</p>
                  </div>
                  <DropdownMenuItem asChild><Link to="/track">My Orders</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="hidden rounded-md bg-[#7a3f2b] px-4 font-semibold text-white hover:bg-[#633222] sm:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
            )}

            <button
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-md p-2.5 text-[#5f4031] hover:bg-[#f4e8dd] md:hidden"
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav className="hidden border-t border-[#f0e2d5] md:block">
          <div className="flex h-11 items-center justify-between">
            {menus.map((group) => (
              <div
                key={group.name}
                className={`group/menu flex h-full items-center gap-1 px-2 text-sm font-semibold text-[#5f4031] hover:text-[#b74e2b] ${
                  location.pathname === group.path ? "text-[#b74e2b]" : ""
                }`}
              >
                <Link to={group.path} className="flex h-full items-center gap-1">
                  {group.name}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Link>
                <div className="invisible absolute left-1/2 top-full z-50 w-[min(1120px,calc(100vw-48px))] -translate-x-1/2 rounded-b-lg border border-[#ead8c8] bg-white p-6 text-[#241711] opacity-0 shadow-2xl transition group-hover/menu:visible group-hover/menu:opacity-100">
                  <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(group.columns.length, 5)}, minmax(150px, 1fr)) ${group.promoImage ? "220px" : ""}` }}>
                    {group.columns.map((column) => (
                      <div key={column.title}>
                        <p className="mb-3 text-sm font-black text-[#241711]">{column.title}</p>
                        <div className="grid gap-2">
                          {column.items.map((item) => (
                            <Link key={item.id} to={item.path} className="flex items-center gap-2 text-sm font-medium text-[#3e2b23] hover:text-[#e5522d]">
                              {item.name}
                              {item.badge && (
                                <span className="rounded-full bg-[#ff3d3d] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    {group.promoImage && (
                      <Link to={group.path} className="overflow-hidden rounded-lg bg-[#fff2e8]">
                        <img src={group.promoImage} alt={group.name} className="h-56 w-full object-cover" />
                        <p className="bg-[#e5522d] px-4 py-3 text-center text-base font-black text-white">
                          {group.name}
                        </p>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </nav>

        {mobileOpen && (
          <div className="border-t border-[#f0e2d5] py-4 md:hidden">
            <form onSubmit={submitSearch} className="mb-4">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search cakes..."
                className="h-11 w-full rounded-md border border-[#e3d3c5] bg-white px-4 text-sm outline-none"
              />
            </form>
            <div className="grid gap-2">
              {menus.map((group) => (
                <Link key={group.name} to={group.path} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-[#5f4031] hover:bg-[#f4e8dd]">
                  {group.name}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-md bg-[#7a3f2b] px-3 py-2 text-center text-sm font-semibold text-white">
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
