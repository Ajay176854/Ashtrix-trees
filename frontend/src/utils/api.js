import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

// const api = axios.create({
//   // baseURL: '/api',
//   baseURL: 'https://undeputized-fertilely-adelaida.ngrok-free.dev/api',
//   headers: { 'Content-Type': 'application/json' },
// })

// const api = axios.create({
//   baseURL: 'https://undeputized-fertilely-adelaida.ngrok-free.dev/api',
//   headers: {
//     'Content-Type': 'application/json',
//     'ngrok-skip-browser-warning': 'true'   // 🔥 MUST ADD
//   },
// })

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8000")

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  config.headers['ngrok-skip-browser-warning'] = 'true'
  return config
})

// Attach token
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 → logout
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
}

export default api

// ─── API helpers ─────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  refresh: (token) => api.post('/auth/refresh', { refresh_token: token }),
}

export const productAPI = {
  list: (params) => api.get('/products', { params }),
  get: (slug) => api.get(`/products/${slug}`),
  reviews: (slug) => api.get(`/products/${slug}/reviews`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (id, formData) =>
    api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (pid, iid) => api.delete(`/products/${pid}/images/${iid}`),
  setPrimaryImage: (pid, iid) => api.patch(`/products/${pid}/images/${iid}/primary`),
  updateStock: (pid, vid, stock) =>
    api.patch(`/products/${pid}/variants/${vid}/stock`, null, { params: { stock } }),
}

export const categoryAPI = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  delete: (id) => api.delete(`/categories/${id}`),
  bulkUpload: (formData) =>
    api.post('/categories/products/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  verifyPayment: (data) => api.post('/orders/verify-payment', data),
  confirmCod: (orderId) => api.post(`/orders/${orderId}/confirm-cod`),
  myOrders: () => api.get('/orders/my'),
  getOrder: (id) => api.get(`/orders/my/${id}`),
  adminList: (params) => api.get('/orders', { params }),
  updateStatus: (id, status, tracking) =>
    api.patch(`/orders/${id}/status`, null, { params: { status, tracking_number: tracking } }),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
}

export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
  list: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  delete: (id) => api.delete(`/coupons/${id}`),
}

export const bannerAPI = {
  list: () => api.get('/banners'),
  delete: (id) => api.delete(`/banners/${id}`),
}

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (id) => api.post(`/wishlist/${id}`),
  remove: (id) => api.delete(`/wishlist/${id}`),
}

export const adminAPI = {
  analytics: () => api.get('/admin/analytics'),
  users: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  pendingReviews: () => api.get('/admin/reviews/pending'),
  approveReview: (id) => api.patch(`/admin/reviews/${id}/approve`),
}

export const reviewAPI = {
  post: (productId, data) => api.post(`/reviews/products/${productId}`, data),
}
