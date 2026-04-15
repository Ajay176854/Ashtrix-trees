import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Heart, User, Menu, X, Search } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import clsx from 'clsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const itemCount = useCartStore(s => s.itemCount)
  const wishIds = useWishlistStore(s => s.ids)
  const { user, token, logout } = useAuthStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQ.trim())}`)
      setSearchOpen(false)
      setSearchQ('')
    }
  }

  const categories = [
    { label: 'Oversized', slug: 'oversized' },
    { label: 'Printed', slug: 'printed' },
    { label: 'Plain', slug: 'plain' },
    { label: 'Acid Wash', slug: 'acid-wash' },
    { label: 'Polo', slug: 'polo' },
  ]

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'bg-brand-black/95 backdrop-blur-md border-brand-border'
          : 'bg-brand-black border-brand-border'
      )}
    >
      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute inset-0 z-50 bg-brand-black flex items-center px-6">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-4">
            <Search size={18} className="text-brand-muted shrink-0" />
            <input
              autoFocus
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search tees, styles, vibes..."
              className="flex-1 bg-transparent text-brand-white text-lg outline-none font-body"
            />
            <button type="submit" className="btn-primary text-xs px-4 py-2">Search</button>
          </form>
          <button onClick={() => setSearchOpen(false)} className="ml-4 text-brand-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-display text-3xl tracking-wider text-brand-white hover:text-brand-accent transition-colors">
            ASHTRIX
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/shop" className="font-body text-sm tracking-widest uppercase text-brand-muted hover:text-brand-white transition-colors">
              All
            </Link>
            {categories.map(c => (
              <Link
                key={c.slug}
                to={`/shop?category=${c.slug}`}
                className="font-body text-sm tracking-widest uppercase text-brand-muted hover:text-brand-white transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-brand-muted hover:text-brand-white transition-colors"
            >
              <Search size={18} />
            </button>

            <Link to="/wishlist" className="relative text-brand-muted hover:text-brand-white transition-colors">
              <Heart size={18} />
              {wishIds.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-accent text-brand-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {wishIds.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative text-brand-muted hover:text-brand-white transition-colors">
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-accent text-brand-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {token ? (
              <div className="relative group">
                <button className="text-brand-muted hover:text-brand-white transition-colors">
                  <User size={18} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-brand-card border border-brand-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-3 border-b border-brand-border">
                    <p className="text-xs text-brand-muted">Signed in as</p>
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                  </div>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-brand-accent hover:bg-brand-hover">
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-brand-hover">My Orders</Link>
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-brand-hover">Profile</Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-brand-muted hover:bg-brand-hover"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="font-body text-sm text-brand-muted hover:text-white transition-colors tracking-wide">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-brand-muted hover:text-white"
              onClick={() => setOpen(o => !o)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-card border-t border-brand-border">
          <nav className="page-container py-4 flex flex-col gap-1">
            <Link to="/shop" className="py-3 text-sm uppercase tracking-widest border-b border-brand-border text-brand-muted">
              All Products
            </Link>
            {categories.map(c => (
              <Link
                key={c.slug}
                to={`/shop?category=${c.slug}`}
                className="py-3 text-sm uppercase tracking-widest border-b border-brand-border text-brand-muted"
              >
                {c.label}
              </Link>
            ))}
            {token ? (
              <>
                <Link to="/orders" className="py-3 text-sm uppercase tracking-widest">My Orders</Link>
                <button onClick={logout} className="py-3 text-sm uppercase tracking-widest text-left text-brand-muted">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="py-3 text-sm uppercase tracking-widest">Sign In</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
