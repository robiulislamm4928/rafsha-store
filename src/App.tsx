import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { useTracking } from "@/hooks/useTracking";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatWidget from "@/components/store/ChatWidget";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import CartDrawer from "@/components/store/CartDrawer";
import PWAInstallPrompt from "@/components/store/PWAInstallPrompt";
import SparkleEffect from "@/components/store/SparkleEffect";
import FloatingCartButton from "@/components/store/FloatingCartButton";
import DynamicMeta from "@/components/DynamicMeta";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ReturnPolicy from "./pages/ReturnPolicy";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";
import Install from "./pages/Install";

// Admin
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminShipping from "./pages/admin/AdminShipping";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminChat from "./pages/admin/AdminChat";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminKeyPoints from "./pages/admin/AdminKeyPoints";
import AdminIncompleteOrders from "./pages/admin/AdminIncompleteOrders";
import AdminQA from "./pages/admin/AdminQA";
import Sitemap from "./pages/Sitemap";

const queryClient = new QueryClient();

const TrackingProvider = () => {
  useTracking();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SiteSettingsProvider>
          <CartProvider>
            <DynamicMeta />
            <TrackingProvider />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/install" element={<Install />} />
              <Route path="/sitemap" element={<Sitemap />} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="shipping" element={<AdminShipping />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="chat" element={<AdminChat />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="key-points" element={<AdminKeyPoints />} />
                <Route path="incomplete-orders" element={<AdminIncompleteOrders />} />
                <Route path="qa" element={<AdminQA />} />
              </Route>


              <Route path="/:categorySlug" element={<CategoryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <WhatsAppButton />
            <CartDrawer />
            <PWAInstallPrompt />
            <SparkleEffect />
          </CartProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
