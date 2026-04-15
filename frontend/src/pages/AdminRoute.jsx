import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

function RedirectWithMessage({ to, message }) {
  useEffect(() => {
    toast.error(message)
  }, [message])
  return <Navigate to={to} replace />
}

export default function AdminRoute({ children }) {
  const { token, user } = useAuthStore()
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== 'admin') {
    return <RedirectWithMessage to="/" message="Unauthorized: Admin access required" />
  }
  
  return children
}
