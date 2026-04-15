import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/layout/AdminLayout'
import HomePage from '@/pages/HomePage'
import ShopPage from '@/pages/ShopPage'
import ProductPage from '@/pages/ProductPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrderSuccessPage from '@/pages/OrderSuccessPage'
import OrdersPage from '@/pages/OrdersPage'
import WishlistPage from '@/pages/WishlistPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'
import BlogIndex from '@/pages/blog/BlogIndex'
import Why240GSMMatters from '@/pages/blog/Why240GSMMatters'
import BestOversizedTamilNadu from '@/pages/blog/BestOversizedTamilNadu'
import FabricComparison from '@/pages/blog/FabricComparison'
import BudgetStreetwearIndia from '@/pages/blog/BudgetStreetwearIndia'
import ChennaiTrends2026 from '@/pages/blog/ChennaiTrends2026'
import StyleOversizedTees from '@/pages/blog/StyleOversizedTees'

// Admin
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminProducts from '@/pages/admin/Products'
import AdminOrders from '@/pages/admin/Orders'
import AdminUsers from '@/pages/admin/Users'
import AdminCoupons from '@/pages/admin/Coupons'
import AdminBanners from '@/pages/admin/Banners'

import ProtectedRoute from '@/pages/ProtectedRoute'
import AdminRoute from '@/pages/AdminRoute'

// Location landing pages
import ThiruvarurPage from '@/pages/locations/ThiruvarurPage'
import MannarguidPage from '@/pages/locations/MannarguidPage'
import NeedamangalamPage from '@/pages/locations/NeedamangalamPage'
import KodavasalPage from '@/pages/locations/KodavasalPage'
import VedaranyamPage from '@/pages/locations/VedaranyamPage'
import ThruthuraipoondiPage from '@/pages/locations/ThruthuraipoondiPage'

import { useAuthStore } from '@/store/authStore'

// Route components are now imported from separate files

export default function App() {
  return (
    <Routes>
      {/* Public / User routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Location SEO Pages ────────────────────── */}
        <Route path="/tshirts-in-thiruvarur" element={<ThiruvarurPage />} />
        <Route path="/tshirts-delivery-mannargudi" element={<MannarguidPage />} />
        <Route path="/buy-tshirts-needamangalam" element={<NeedamangalamPage />} />
        <Route path="/tshirts-kodavasal" element={<KodavasalPage />} />
        <Route path="/tshirts-vedaranyam" element={<VedaranyamPage />} />
        <Route path="/tshirts-thruthuraipoondi" element={<ThruthuraipoondiPage />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/why-240-gsm-matters" element={<Why240GSMMatters />} />
        <Route path="/blog/best-oversized-tshirts-tamil-nadu" element={<BestOversizedTamilNadu />} />
        <Route path="/blog/fabric-weight-comparison" element={<FabricComparison />} />
        <Route path="/blog/budget-streetwear-india" element={<BudgetStreetwearIndia />} />
        <Route path="/blog/chennai-streetwear-trends-2026" element={<ChennaiTrends2026 />} />
        <Route path="/blog/style-oversized-tees-2026" element={<StyleOversizedTees />} />

        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-success/:orderNumber" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="banners" element={<AdminBanners />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
