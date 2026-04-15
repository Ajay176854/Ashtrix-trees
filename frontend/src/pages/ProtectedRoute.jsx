import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

export default function ProtectedRoute({ children, adminOnly = false }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  // not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // admin check
  if (adminOnly && user.role !== "admin") {
    toast.error("Unauthorized: Admin access required")
    return <Navigate to="/" />
  }

  return children
}