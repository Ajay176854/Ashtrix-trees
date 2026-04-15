import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, Heart, Share2, Star, ChevronDown } from 'lucide-react'
import { productAPI, reviewAPI, getImageUrl } from '@/utils/api'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import SEOHead from '@/components/seo/SEOHead'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

export default function ProductPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [selectedSize, setSelectedSize] = useState(null)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [reviewOpen, setReviewOpen] = useState(false)

  const addItem = useCartStore(s => s.addItem)
  const { isWishlisted, toggle } = useWishlistStore()
  const { token } = useAuthStore()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productAPI.get(slug).then(r => r.data),
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => productAPI.reviews(slug).then(r => r.data),
    enabled: !!product,
  })

  if (isLoading) {
    return (
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-brand-card animate-pulse" />
          <div className="space-y-4">
            {[200, 100, 150, 80].map(w => (
              <div key={w} className="h-6 bg-brand-card animate-pulse rounded" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const images = product.images?.length
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', alt_text: product.name }]

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    addItem(product, selectedSize, qty)
    toast.success(`${product.name} added to cart!`)
  }

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    addItem(product, selectedSize, qty)
    navigate('/checkout')   // ✅ use here
  }

  const handleReview = async () => {
    if (!token) { toast.error('Login to review'); return }
    try {
      await reviewAPI.post(product.id, reviewForm)
      toast.success('Review submitted for approval!')
      setReviewOpen(false)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error submitting review')
    }
  }

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const buildProductSchema = (p) => [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.description || `Buy ${p.name} online from Ashtrix Tees. Premium ${p.category?.name} t-shirt. Delivered across Thiruvarur, Tamil Nadu.`,
      image: p.images?.map(img => getImageUrl(img.url)) || [],
      brand: { '@type': 'Brand', name: 'Ashtrix Tees' },
      sku: p.slug,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: p.price,
        priceValidUntil: '2026-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: p.variants?.some(v => v.stock > 0)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'Ashtrix Tees', url: 'https://ashtrixtees.com' },
      },
      aggregateRating: reviews?.length ? {
        '@type': 'AggregateRating',
        ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
        reviewCount: reviews.length,
      } : undefined,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `Is the ${p.name} available for delivery in Thiruvarur?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Yes, Ashtrix Tees delivers ${p.name} to all locations in Thiruvarur district, including Thruthuraipoondi, Mannargudi, and Needamangalam within 3-6 days.`,
          },
        },
        {
          '@type': 'Question',
          name: 'What is the fabric quality of this t-shirt?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'All our t-shirts are made from premium 240 GSM 100% combed cotton, ensuring a heavy, non-transparent feel and maximum comfort.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I return this product if it doesn\'t fit?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, we offer a hassle-free 7-day return policy. If you\'re not satisfied with the fit or quality, you can initiate a return easily.',
          },
        },
      ],
    }
  ]

  return (
    <div className="page-container py-12">
      <SEOHead
        title={`Buy ${product.name} Online Under ₹999 | Best ${product.category?.name || 'T-Shirt'} – Ashtrix Tees`}
        description={`🔥 Get the ${product.name} today for just ₹${Number(product.price).toLocaleString('en-IN')}! Premium 240 GSM ${product.category?.name} tee. Free shipping above ₹499. Fast delivery to Thiruvarur & all Tamil Nadu.`}
        canonical={`/product/${product.slug}`}
        image={product.images?.[0]?.url ? getImageUrl(product.images[0].url) : undefined}
        schema={buildProductSchema(product)}
      />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-xs text-brand-muted mb-8">
        <Link to="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-white">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-white">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-brand-white truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden bg-brand-card">
            <img
              src={getImageUrl(images[activeImg]?.url)}
              alt={images[activeImg]?.alt_text || `${product.name} – ${product.category?.name} T-Shirt by Ashtrix Tees`}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={clsx(
                    'w-20 h-20 shrink-0 overflow-hidden border-2 transition-colors',
                    activeImg === i ? 'border-brand-accent' : 'border-transparent'
                  )}
                >
                  <img src={getImageUrl(img.url)} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-xs text-brand-muted tracking-widest uppercase mb-2">
                {product.category?.name}
              </p>
              <h1 className="font-display text-4xl tracking-wider leading-tight">{product.name}</h1>
            </div>
            <button
              onClick={() => toggle(product.id)}
              className={clsx(
                'p-2 border transition-colors mt-1',
                isWishlisted(product.id)
                  ? 'border-brand-accent text-brand-accent'
                  : 'border-brand-border text-brand-muted hover:border-white hover:text-white'
              )}
            >
              <Heart size={16} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Rating */}
          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14}
                    className={s <= Math.round(avgRating) ? 'text-brand-accent fill-brand-accent' : 'text-brand-border'} />
                ))}
              </div>
              <span className="font-mono text-xs text-brand-muted">{avgRating} ({reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-display text-4xl tracking-wider">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.compare_price && (
              <>
                <span className="font-body text-lg text-brand-muted line-through">
                  ₹{Number(product.compare_price).toLocaleString('en-IN')}
                </span>
                <span className="badge-sale">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Size selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs tracking-widest uppercase text-brand-muted">Select Size</span>
              <button className="font-mono text-xs text-brand-accent">Size Guide</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.variants?.map(v => (
                <button
                  key={v.id}
                  disabled={v.stock === 0}
                  onClick={() => setSelectedSize(v.size)}
                  className={clsx(
                    'w-12 h-12 font-mono text-xs font-medium border transition-all',
                    v.stock === 0
                      ? 'border-brand-border text-brand-border cursor-not-allowed line-through'
                      : selectedSize === v.size
                      ? 'border-brand-accent bg-brand-accent text-brand-black'
                      : 'border-brand-border text-brand-muted hover:border-white hover:text-white'
                  )}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-xs tracking-widest uppercase text-brand-muted">Qty</span>
            <div className="flex items-center border border-brand-border">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 text-brand-muted hover:text-white transition-colors">-</button>
              <span className="w-10 h-10 flex items-center justify-center font-mono text-sm">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 text-brand-muted hover:text-white transition-colors">+</button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 mb-8">
            <button onClick={handleAddToCart} className="btn-outline flex-1 flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} className="btn-primary flex-1">
              Buy Now
            </button>
          </div>

          {/* Free shipping notice */}
          <div className="border border-brand-border p-4 mb-8">
            <p className="font-mono text-xs text-brand-muted flex flex-wrap items-center gap-y-2 gap-x-3">
              <span className="flex items-center gap-1.5"><span>🚚</span> <span className="text-white">Free shipping</span> on orders above ₹499</span>
              <span className="hidden sm:inline text-brand-border">|</span>
              <span className="flex items-center gap-1.5"><span>🔄</span> <span className="text-white">7-day</span> easy returns</span>
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-brand-border pt-6">
              <h3 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-3">Description</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 border-t border-brand-border pt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl tracking-wider">REVIEWS ({reviews?.length || 0})</h2>
          <button onClick={() => setReviewOpen(o => !o)} className="btn-outline text-sm">
            Write a Review
          </button>
        </div>

        {/* Review form */}
        {reviewOpen && (
          <div className="border border-brand-border p-6 mb-8">
            <h3 className="font-mono text-xs tracking-widest uppercase mb-4">Your Review</h3>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                  <Star size={20} className={s <= reviewForm.rating ? 'text-brand-accent fill-brand-accent' : 'text-brand-border'} />
                </button>
              ))}
            </div>
            <input
              value={reviewForm.title}
              onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Review title"
              className="input-field mb-3"
            />
            <textarea
              value={reviewForm.body}
              onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Share your experience..."
              rows={4}
              className="input-field resize-none mb-4"
            />
            <button onClick={handleReview} className="btn-primary">Submit Review</button>
          </div>
        )}

        {/* Review list */}
        <div className="space-y-6">
          {reviews?.map(r => (
            <div key={r.id} className="border-b border-brand-border pb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{r.user?.name}</p>
                  <div className="flex mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12}
                        className={s <= r.rating ? 'text-brand-accent fill-brand-accent' : 'text-brand-border'} />
                    ))}
                  </div>
                </div>
                <span className="font-mono text-xs text-brand-muted">
                  {new Date(r.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              {r.title && <p className="font-medium text-sm mt-2 mb-1">{r.title}</p>}
              {r.body && <p className="text-sm text-brand-muted">{r.body}</p>}
              {r.is_verified && (
                <span className="font-mono text-[10px] text-brand-accent mt-2 block">✓ Verified Purchase</span>
              )}
            </div>
          ))}
          {(!reviews || reviews.length === 0) && (
            <p className="text-brand-muted text-sm">No reviews yet. Be the first!</p>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-20 border-t border-brand-border pt-12">
        <h2 className="font-display text-3xl tracking-wider mb-8">FREQUENTLY ASKED<br /><span className="text-brand-muted">QUESTIONS</span></h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              q: `Is the ${product.name} available for delivery in Thiruvarur?`,
              a: `Yes, Ashtrix Tees delivers ${product.name} to all locations in Thiruvarur district, including Thruthuraipoondi, Mannargudi, and Needamangalam within 3-6 business days.`
            },
            {
              q: 'What is the fabric quality of this t-shirt?',
              a: 'All our t-shirts are made from premium 240 GSM 100% combed cotton, ensuring a heavy, non-transparent feel and maximum comfort.'
            },
            {
              q: 'Can I return this product if it doesn\'t fit?',
              a: 'Yes, we offer a hassle-free 7-day return policy. If you\'re not satisfied with the fit or quality, you can initiate a return easily.'
            },
            {
              q: 'Is Cash on Delivery available?',
              a: 'Yes! We offer COD for all orders across Tamil Nadu so you can pay once you receive the product.'
            }
          ].map((item, i) => (
            <div key={i} className="border border-brand-border p-6 bg-brand-card">
              <h4 className="font-body font-semibold text-sm text-brand-white mb-2">{item.q}</h4>
              <p className="text-sm text-brand-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
