import { Link } from 'react-router-dom'
import { Instagram, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-brand-card border-t border-brand-border mt-24">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h2 className="font-display text-4xl tracking-wider mb-4">ASHTRIX</h2>
            <p className="text-brand-muted text-sm leading-relaxed mb-6">
              Premium streetwear for the culture.<br />
              Made different. Worn loud.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/ashtrix_tees" target="_blank" rel="noreferrer"
                className="text-brand-muted hover:text-brand-accent transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-brand-muted hover:text-brand-accent transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-brand-muted hover:text-brand-accent transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-4">Shop</h4>
            <ul className="space-y-3">
              {[
                ['All Products', '/shop'],
                ['Oversized', '/shop?category=oversized'],
                ['Printed', '/shop?category=printed'],
                ['Plain', '/shop?category=plain'],
                ['Acid Wash', '/shop?category=acid-wash'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-sm text-brand-muted hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-4">Account</h4>
            <ul className="space-y-3">
              {[
                ['My Orders', '/orders'],
                ['Wishlist', '/wishlist'],
                ['Profile', '/profile'],
                ['Login', '/login'],
                ['Register', '/register'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-sm text-brand-muted hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-4">Info</h4>
            <ul className="space-y-3">
              {[
                'About Us', 'Size Guide', 'Shipping Policy',
                'Returns & Exchange', 'Contact Us',
              ].map(label => (
                <li key={label}>
                  <a href="#" className="text-sm text-brand-muted hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-brand-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-brand-muted tracking-wider">
            © 2025 ASHTRIX TEES. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-4">
            <img src="https://img.shields.io/badge/Razorpay-02042B?logo=razorpay&logoColor=3395FF" alt="Razorpay" className="h-5 opacity-60" />
            <span className="font-mono text-xs text-brand-muted">MADE IN INDIA 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
