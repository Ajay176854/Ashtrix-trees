// ─── WISHLIST PAGE ────────────────────────────────────────────
import { useQuery } from '@tanstack/react-query'
import { wishlistAPI } from '@/utils/api'
import ProductCard from '@/components/product/ProductCard'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function WishlistPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.get().then(r => r.data),
  })

  if (isLoading) return (
    <div className="page-container py-12">
      <h1 className="font-display text-5xl tracking-wider mb-10">WISHLIST</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-brand-card animate-pulse" />)}
      </div>
    </div>
  )

  if (!data?.length) return (
    <div className="page-container py-24 text-center">
      <Heart size={48} className="text-brand-muted mx-auto mb-4" />
      <p className="font-display text-4xl text-brand-muted mb-4">EMPTY WISHLIST</p>
      <Link to="/shop" className="btn-primary inline-block">Explore Products</Link>
    </div>
  )

  const products = data.map(w => ({
    ...w.product,
    primary_image: w.product?.images?.[0]?.url,
  }))

  return (
    <div className="page-container py-12">
      <h1 className="font-display text-5xl tracking-wider mb-10">WISHLIST ({products.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}

export default WishlistPage
