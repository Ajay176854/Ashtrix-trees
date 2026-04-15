import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ArrowRight, Tag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { couponAPI, getImageUrl } from '@/utils/api'
import { useAuthStore } from '@/store/authStore'
import SEOHead from '@/components/seo/SEOHead'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, removeItem, updateQty, coupon, discount, setCoupon, removeCoupon, clearCart } = useCartStore()
  const [couponCode, setCouponCode] = useState('')
  const [applying, setApplying] = useState(false)
  const { token } = useAuthStore()

  const subtotal = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)
  // Estimated shipping — exact fee calculated at checkout based on state/zone
  const estimatedFree = subtotal >= 599  // local TN free threshold
  const total = subtotal - discount + (estimatedFree ? 0 : 45) // use base estimate for total

  const handleApplyCoupon = async () => {
    if (!token) { toast.error('Login to apply coupon'); return }
    if (!couponCode.trim()) return
    setApplying(true)
    try {
      const { data } = await couponAPI.validate({ code: couponCode, order_total: subtotal })
      setCoupon(couponCode, data.discount)
      toast.success(`Coupon applied! ₹${data.discount} off`)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Invalid coupon')
    } finally {
      setApplying(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-container py-24 text-center">
        <SEOHead title="Your Cart" noIndex={true} />
        <p className="font-display text-6xl text-brand-muted mb-4">EMPTY CART</p>
        <p className="text-brand-muted mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          Shop Now <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container py-12">
      <SEOHead title="Your Cart" noIndex={true} />
      <h1 className="font-display text-5xl tracking-wider mb-10">YOUR CART</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, size, quantity }) => (
            <div key={`${product.id}-${size}`}
              className="flex gap-4 border border-brand-border p-4 bg-brand-card">
              <Link to={`/product/${product.slug}`} className="w-24 h-32 shrink-0 bg-brand-hover overflow-hidden">
                <img
                  src={getImageUrl(product.primary_image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/product/${product.slug}`}>
                  <h3 className="font-medium text-sm mb-1 hover:text-brand-accent transition-colors truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="font-mono text-xs text-brand-muted mb-3">Size: {size}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-brand-border">
                    <button
                      onClick={() => updateQty(product.id, size, quantity - 1)}
                      className="w-8 h-8 text-brand-muted hover:text-white transition-colors text-sm"
                    >-</button>
                    <span className="w-8 h-8 flex items-center justify-center font-mono text-xs">{quantity}</span>
                    <button
                      onClick={() => updateQty(product.id, size, quantity + 1)}
                      className="w-8 h-8 text-brand-muted hover:text-white transition-colors text-sm"
                    >+</button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-semibold">
                      ₹{(Number(product.price) * quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeItem(product.id, size)}
                      className="text-brand-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button onClick={clearCart} className="font-mono text-xs text-brand-muted hover:text-white transition-colors">
              Clear Cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="border border-brand-border p-6 bg-brand-card">
            <h2 className="font-display text-2xl tracking-wider mb-6">ORDER SUMMARY</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-brand-accent flex items-center gap-1">
                    <Tag size={12} /> {coupon}
                  </span>
                  <span className="text-brand-accent">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Shipping (Estimated)</span>
                <span>{estimatedFree ? <span className="text-brand-accent">FREE</span> : `from ₹45`}</span>
              </div>
              {!estimatedFree && (
                <p className="font-mono text-[10px] text-brand-muted">
                  Exact fee by state at checkout · Free from ₹599 (TN) to ₹1,499
                </p>
              )}
            </div>

            <div className="border-t border-brand-border pt-4 mb-6">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-xl">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Coupon */}
            {coupon ? (
              <div className="flex items-center justify-between border border-brand-accent/30 p-3 mb-4 bg-brand-accent/5">
                <span className="font-mono text-xs text-brand-accent">{coupon} applied</span>
                <button onClick={removeCoupon} className="text-brand-muted hover:text-white">
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="COUPON CODE"
                  className="input-field flex-1 text-xs"
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applying}
                  className="btn-outline text-xs px-4 py-2"
                >
                  {applying ? '...' : 'Apply'}
                </button>
              </div>
            )}

            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Checkout <ArrowRight size={16} />
            </Link>

            <Link to="/shop" className="btn-ghost w-full text-center mt-3 block text-xs">
              ← Continue Shopping
            </Link>
          </div>

          {/* Accepted payments */}
          <div className="border border-brand-border p-4 text-center">
            <p className="font-mono text-[10px] text-brand-muted tracking-widest mb-2">SECURE CHECKOUT WITH</p>
            <p className="text-xs text-brand-muted">UPI · Cards · Net Banking · COD</p>
          </div>
        </div>
      </div>
    </div>
  )
}
