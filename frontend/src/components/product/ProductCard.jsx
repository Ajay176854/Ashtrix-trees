import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { getImageUrl } from '@/utils/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ProductCard({ product, className }) {
  const { isWishlisted, toggle } = useWishlistStore()
  const addItem = useCartStore(s => s.addItem)
  const wishlisted = isWishlisted(product.id)

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  const handleQuickAdd = (e) => {
    e.preventDefault()
    addItem(product, 'M')
    toast.success(`Added to cart!`)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    toggle(product.id)
    toast(wishlisted ? 'Removed from wishlist' : '♥ Added to wishlist', {
      icon: wishlisted ? '🤍' : '❤️',
    })
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className={clsx('group block', className)}
    >
      <div className="card-product relative overflow-hidden">
        {/* Image */}
        <div className="aspect-[3/4] bg-brand-hover overflow-hidden relative">
          <img
            src={getImageUrl(product.primary_image)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/20 transition-all duration-300" />

          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-8 group-hover:translate-x-0 transition-transform duration-300">
            <button
              onClick={handleWishlist}
              className={clsx(
                'w-8 h-8 flex items-center justify-center bg-brand-black/80 backdrop-blur-sm transition-colors',
                wishlisted ? 'text-brand-accent' : 'text-white hover:text-brand-accent'
              )}
            >
              <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              className="w-full bg-brand-accent text-brand-black font-body font-semibold text-xs tracking-widest uppercase py-3 flex items-center justify-center gap-2 hover:bg-white transition-colors"
            >
              <ShoppingBag size={12} />
              Quick Add
            </button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discount && (
              <span className="badge-sale">{discount}% OFF</span>
            )}
            {product.is_featured && (
              <span className="font-mono text-[10px] bg-white text-brand-black px-2 py-0.5 tracking-wider">
                FEATURED
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">
            {product.category_id && 'T-Shirt'}
          </p>
          <h3 className="font-body font-medium text-sm text-brand-white truncate mb-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-body font-semibold text-brand-white">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.compare_price && (
              <span className="font-body text-xs text-brand-muted line-through">
                ₹{Number(product.compare_price).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {product.avg_rating && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={s <= Math.round(product.avg_rating) ? 'text-brand-accent text-xs' : 'text-brand-border text-xs'}>★</span>
                ))}
              </div>
              <span className="font-mono text-[10px] text-brand-muted">({product.review_count})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
