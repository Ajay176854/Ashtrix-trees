import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Image, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Coupons', icon: Tag, href: '/admin/coupons' },
  { label: 'Banners', icon: Image, href: '/admin/banners' },
]

export default function AdminLayout() {
  const location = useLocation()
  const logout = useAuthStore(s => s.logout)

  return (
    <div className="min-h-screen flex bg-brand-black">
      {/* Sidebar */}
      <aside className="w-60 bg-brand-card border-r border-brand-border flex flex-col">
        <div className="p-6 border-b border-brand-border">
          <Link to="/" className="font-display text-2xl tracking-wider text-brand-accent">
            ASHTRIX
          </Link>
          <p className="font-mono text-xs text-brand-muted mt-1 tracking-wider">ADMIN PANEL</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              to={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                location.pathname === href
                  ? 'bg-brand-accent text-brand-black font-medium'
                  : 'text-brand-muted hover:text-white hover:bg-brand-hover'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 text-sm text-brand-muted hover:text-white w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
