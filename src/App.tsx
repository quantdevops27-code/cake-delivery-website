import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageLoader from "./components/PageLoader";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const OrderTrack = lazy(() => import("./pages/OrderTrack"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const AdminHero = lazy(() => import("./pages/Admin/Hero"));
const AdminCollections = lazy(() => import("./pages/Admin/Collections"));
const AdminOrders = lazy(() => import("./pages/Admin/Orders"));
const AdminProducts = lazy(() => import("./pages/Admin/Products"));
const AdminAddOns = lazy(() => import("./pages/Admin/AddOns"));
const AdminLocations = lazy(() => import("./pages/Admin/Locations"));
const AdminOccasions = lazy(() => import("./pages/Admin/Occasions"));
const AdminCustomers = lazy(() => import("./pages/Admin/Customers"));
const AdminSegments = lazy(() => import("./pages/Admin/Segments"));
const AdminCampaigns = lazy(() => import("./pages/Admin/Campaigns"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8EDEB]">
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track" element={<OrderTrack />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/hero" element={<AdminHero />} />
          <Route path="/admin/collections" element={<AdminCollections />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/add-ons" element={<AdminAddOns />} />
          <Route path="/admin/locations" element={<AdminLocations />} />
          <Route path="/admin/occasions" element={<AdminOccasions />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/segments" element={<AdminSegments />} />
          <Route path="/admin/campaigns" element={<AdminCampaigns />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}
