import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'

export function ProfilePage() {
  const { user, logout } = useAuthStore()
  return (
    <div className="page-container py-12 max-w-lg">
      <h1 className="font-display text-5xl tracking-wider mb-10">PROFILE</h1>
      <div className="border border-brand-border p-6 bg-brand-card space-y-4">
        <div>
          <p className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">Name</p>
          <p className="font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        {user?.phone && (
          <div>
            <p className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">Phone</p>
            <p className="font-medium">{user.phone}</p>
          </div>
        )}
        <div>
          <p className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">Member Since</p>
          <p className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '-'}</p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Link to="/orders" className="btn-outline flex-1 text-center text-sm">My Orders</Link>
        <Link to="/wishlist" className="btn-outline flex-1 text-center text-sm">Wishlist</Link>
        <button onClick={logout} className="btn-ghost text-sm">Sign Out</button>
      </div>
    </div>
  )
}

export default ProfilePage
