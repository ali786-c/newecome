import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRateLimitToast } from "@/hooks/use-rate-limit-toast";

function GlobalListeners() {
  useRateLimitToast();
  return null;
}

import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const EmailVerification = lazy(() => import("@/pages/auth/EmailVerification"));
const Unauthorized = lazy(() => import("@/pages/auth/Unauthorized"));

const Home = lazy(() => import("@/pages/public/Home"));
const Products = lazy(() => import("@/pages/public/Products"));
const ProductDetail = lazy(() => import("@/pages/public/ProductDetail"));
const Category = lazy(() => import("@/pages/public/Category"));
const Pricing = lazy(() => import("@/pages/public/Pricing"));
const FAQ = lazy(() => import("@/pages/public/FAQ"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const About = lazy(() => import("@/pages/public/About"));
const Blog = lazy(() => import("@/pages/public/Blog"));
const BlogArticle = lazy(() => import("@/pages/public/BlogArticle"));
const Trust = lazy(() => import("@/pages/public/Trust"));
const Privacy = lazy(() => import("@/pages/public/Privacy"));
const Terms = lazy(() => import("@/pages/public/Terms"));
const RefundPolicy = lazy(() => import("@/pages/public/RefundPolicy"));
const AcceptableUse = lazy(() => import("@/pages/public/AcceptableUse"));
const LegalInfo = lazy(() => import("@/pages/public/LegalInfo"));
const Affiliates = lazy(() => import("@/pages/public/Affiliates"));
const Feedback = lazy(() => import("@/pages/public/Feedback"));
const Checkout = lazy(() => import("@/pages/public/Checkout"));
const Status = lazy(() => import("@/pages/public/Status"));

const CustomerDashboard = lazy(() => import("@/pages/customer/Dashboard"));
const Orders = lazy(() => import("@/pages/customer/Orders"));
const WalletPage = lazy(() => import("@/pages/customer/Wallet"));
const TopUp = lazy(() => import("@/pages/customer/TopUp"));
const AccountSettings = lazy(() => import("@/pages/customer/Settings"));
const Tickets = lazy(() => import("@/pages/customer/Tickets"));
const Referrals = lazy(() => import("@/pages/customer/Referrals"));
const Notifications = lazy(() => import("@/pages/customer/Notifications"));
const MyProducts = lazy(() => import("@/pages/customer/MyProducts"));

const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/Products"));
const AdminCategories = lazy(() => import("@/pages/admin/Categories"));
const AdminPricing = lazy(() => import("@/pages/admin/Pricing"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminCustomers = lazy(() => import("@/pages/admin/Customers"));
const AdminBlog = lazy(() => import("@/pages/admin/Blog"));
const Automation = lazy(() => import("@/pages/admin/Automation"));
const AdminAIBlog = lazy(() => import("@/pages/admin/AIBlog"));
const Integrations = lazy(() => import("@/pages/admin/Integrations"));
const TelegramPanel = lazy(() => import("@/pages/admin/TelegramPanel"));
const DiscordPanel = lazy(() => import("@/pages/admin/DiscordPanel"));
const SyncLogs = lazy(() => import("@/pages/admin/SyncLogs"));
const AuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));
const Compliance = lazy(() => import("@/pages/admin/Compliance"));
const AdminTickets = lazy(() => import("@/pages/admin/Tickets"));
const SupplierImport = lazy(() => import("@/pages/admin/SupplierImport"));
const SupplierBalance = lazy(() => import("@/pages/admin/SupplierBalance"));
const SupplierSync = lazy(() => import("@/pages/admin/G2GSync"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const Payments = lazy(() => import("@/pages/admin/Payments"));
const Analytics = lazy(() => import("@/pages/admin/Analytics"));
const SocialMedia = lazy(() => import("@/pages/admin/SocialMedia"));
const SEO = lazy(() => import("@/pages/admin/SEO"));
const ProductVault = lazy(() => import("@/pages/admin/ProductVault"));
const Coupons = lazy(() => import("@/pages/admin/Coupons"));
const WishlistPage = lazy(() => import("@/pages/customer/Wishlist"));
const RewardsPage = lazy(() => import("@/pages/customer/Rewards"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CartProvider>
            <BrowserRouter>
              <AuthProvider>
                <GlobalListeners />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route element={<PublicLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:slug" element={<ProductDetail />} />
                      <Route path="/categories/:slug" element={<Category />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogArticle />} />
                      <Route path="/trust" element={<Trust />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      <Route path="/acceptable-use" element={<AcceptableUse />} />
                      <Route path="/legal" element={<LegalInfo />} />
                      <Route path="/affiliates" element={<Affiliates />} />
                      <Route path="/feedback" element={<Feedback />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/status" element={<Status />} />
                    </Route>

                    <Route element={<AuthLayout />}>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/verify-email" element={<EmailVerification />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />
                    </Route>

                    <Route element={<AuthGuard />}>
                      <Route element={<CustomerLayout />}>
                        <Route path="/dashboard" element={<CustomerDashboard />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/my-products" element={<MyProducts />} />
                        <Route path="/wallet" element={<WalletPage />} />
                        <Route path="/wallet/top-up" element={<TopUp />} />
                        <Route path="/settings" element={<AccountSettings />} />
                        <Route path="/tickets" element={<Tickets />} />
                        <Route path="/referrals" element={<Referrals />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/rewards" element={<RewardsPage />} />
                      </Route>
                    </Route>

                    <Route element={<AuthGuard />}>
                      <Route element={<RoleGuard allowedRoles={['admin']} />}>
                        <Route element={<AdminLayout />}>
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/admin/products" element={<AdminProducts />} />
                          <Route path="/admin/categories" element={<AdminCategories />} />
                          <Route path="/admin/pricing" element={<AdminPricing />} />
                          <Route path="/admin/orders" element={<AdminOrders />} />
                          <Route path="/admin/customers" element={<AdminCustomers />} />
                          <Route path="/admin/blog" element={<AdminBlog />} />
                          <Route path="/admin/ai-blog" element={<AdminAIBlog />} />
                          <Route path="/admin/automation" element={<Automation />} />
                          <Route path="/admin/integrations" element={<Integrations />} />
                          <Route path="/admin/integrations/telegram" element={<TelegramPanel />} />
                          <Route path="/admin/integrations/discord" element={<DiscordPanel />} />
                          <Route path="/admin/sync-logs" element={<SyncLogs />} />
                          <Route path="/admin/audit-logs" element={<AuditLogs />} />
                          <Route path="/admin/compliance" element={<Compliance />} />
                          <Route path="/admin/tickets" element={<AdminTickets />} />
                          <Route path="/admin/supplier-import" element={<SupplierImport />} />
                          <Route path="/admin/supplier-balance" element={<SupplierBalance />} />
                          <Route path="/admin/supplier-sync" element={<SupplierSync />} />
                          <Route path="/admin/product-vault" element={<ProductVault />} />
                          <Route path="/admin/coupons" element={<Coupons />} />
                          <Route path="/admin/settings" element={<AdminSettings />} />
                          <Route path="/admin/payments" element={<Payments />} />
                          <Route path="/admin/analytics" element={<Analytics />} />
                          <Route path="/admin/social-media" element={<SocialMedia />} />
                          <Route path="/admin/seo" element={<SEO />} />
                        </Route>
                      </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AuthProvider>
            </BrowserRouter>
          </CartProvider>
        </TooltipProvider>
        <Toaster />
        <Sonner />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
