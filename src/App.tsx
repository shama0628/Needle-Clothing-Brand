import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { AdminProvider } from './context/AdminContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminCMSPage } from './pages/admin/AdminCMSPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminColorTheoryPage } from './pages/admin/AdminColorTheoryPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Customer Storefront Pages (Phase 1)
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { FindYourColorsPage } from './pages/FindYourColorsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { WishlistPage } from './pages/WishlistPage';
import {
  AboutPage,
  ContactPage,
  SizeGuidePage,
  ShippingReturnsPage,
  FAQPage,
  PrivacyPolicyPage,
  TermsPage
} from './pages/UtilityPages';

// ScrollToTop on path change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main App Router and Layout Controller
const AppRouter: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCheckout = location.pathname.startsWith('/checkout');

  if (isAdmin) {
    return (
      <>
        <ScrollToTop />
        <Toast />
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="cms" element={<AdminCMSPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="color-theory" element={<AdminColorTheoryPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            {/* Catch-all unknown admin subpaths */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </>
    );
  }

  // Customer Storefront Layout (Phase 1)
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <NavigationDrawer />
      <CartDrawer />
      <SearchModal />
      <SizeGuideModal />
      <AuthModal />
      <Toast />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<CategoryPage />} />
          <Route path="/find-your-colors" element={<FindYourColorsPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Utility Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Dynamic Category & Subcategory Routes */}
          <Route path="/:category" element={<CategoryPage />} />
          <Route path="/:category/:subcategory" element={<CategoryPage />} />
        </Routes>
      </div>

      {!isCheckout && <Footer />}

      {/* Floating Shortcut to Admin Console */}
      <Link
        to="/admin"
        className="fixed bottom-5 right-5 z-40 bg-theme-accent text-theme-accent-contrast border border-theme-border px-3.5 py-2 rounded-full text-[11px] font-semibold tracking-wider uppercase shadow-2xl hover:opacity-90 hover:scale-105 transition-all flex items-center gap-2 group"
        title="Open Admin Management System (Documentation 02)"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>Admin Console</span>
        <span className="text-[9px] text-theme-muted group-hover:text-theme-accent-contrast">↗</span>
      </Link>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AdminProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </AdminProvider>
      </StoreProvider>
    </ThemeProvider>
  );
};

export default App;
