import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { productAPI, categoryAPI } from '@/utils/api'
import ProductCard from '@/components/product/ProductCard'
import SEOHead from '@/components/seo/SEOHead'
import clsx from 'clsx'

const CATEGORY_META = {
  oversized: {
    title: 'Best Oversized T-Shirts Online Under ₹999 | Ashtrix Tees Tamil Nadu',
    description: '🔥 Shop the #1 oversized tees collection in Tamil Nadu. 240 GSM heavy cotton. Starting from ₹299. Free shipping above ₹499. Buy now!',
  },
  printed: {
    title: 'Trending Printed T-Shirts & Graphic Tees | Ashtrix Tees TN',
    description: 'Get the most unique graphic tees online! Limited edition printed t-shirts starting ₹349. Premium quality, delivered fast across Tamil Nadu.',
  },
  plain: {
    title: 'Premium Plain T-Shirts | Best 240 GSM Cotton Tees Online',
    description: 'Shop essential plain t-shirts for just ₹299. 100% combed cotton, non-transparent quality. Free shipping above ₹499. Order yours today!',
  },
  'acid-wash': {
    title: 'Hottest Acid Wash T-Shirts Online | Ashtrix Tees Streetwear',
    description: 'Grab the latest acid wash trend! Unique vintage washes, premium heavy cotton. Starting ₹399. Delivered to Thiruvarur & all Tamil Nadu.',
  },
  polo: {
    title: 'Classic Polo T-Shirts Under ₹999 | Ashtrix Tees Premium',
    description: 'Shop high-end polo t-shirts at affordable prices. Perfect fit, premium cotton. Free delivery across Tamil Nadu on orders above ₹499.',
  },
  crop: {
    title: 'Stylish Crop Top T-Shirts | Trending Fits – Ashtrix Tees',
    description: 'Buy the cutest crop tops starting ₹299. Premium cotton, perfect for summer. Delivered across Thiruvarur district & Tamil Nadu.',
  },
}

const DEFAULT_SHOP_META = {
  title: 'Shop Best T-Shirts Online – Oversized & Printed Tees Under ₹999',
  description: '🔥 Browse the full Ashtrix Tees collection. Premium 240 GSM cotton streetwear starting at ₹299. Free shipping above ₹499. Fast delivery in Tamil Nadu!',
}


const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const featured = searchParams.get('featured') || ''

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.list().then(r => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['products', { category, search, sort, page, featured }],
    queryFn: () =>
      productAPI.list({
        category: category || undefined,
        search: search || undefined,
        sort,
        page,
        per_page: 24,
        featured: featured === 'true' ? true : undefined,
      }).then(r => r.data),
    keepPreviousData: true,
  })

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    if (key !== 'page') params.delete('page')
    setSearchParams(params)
  }

  const shopMeta = category ? (CATEGORY_META[category] || DEFAULT_SHOP_META) : DEFAULT_SHOP_META
  const searchMeta = search
    ? { title: `Search: "${search}" – Ashtrix Tees`, description: `Search results for "${search}" at Ashtrix Tees. Premium t-shirts delivered across Thiruvarur, Tamil Nadu.` }
    : null
  const activeMeta = searchMeta || shopMeta

  return (
    <div className="page-container py-12">
      <SEOHead
        title={activeMeta.title}
        description={activeMeta.description}
        canonical={category ? `/shop?category=${category}` : '/shop'}
      />
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-xs text-brand-muted tracking-widest uppercase mb-2">
            {search ? `Search: "${search}"` : category ? categories?.find(c => c.slug === category)?.name : 'All Products'}
          </p>
          <h1 className="font-display text-5xl tracking-wider">
            {search ? 'SEARCH' : category ? category.toUpperCase().replace('-', ' ') : 'SHOP ALL'}
          </h1>
        </div>
        {data && (
          <p className="font-mono text-xs text-brand-muted">{data.total} products</p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={clsx(
          'w-56 shrink-0 hidden md:block'
        )}>
          <div className="sticky top-24 space-y-8">
            {/* Categories */}
            <div>
              <h3 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-4">Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setParam('category', '')}
                  className={clsx(
                    'block w-full text-left text-sm py-1.5 transition-colors',
                    !category ? 'text-brand-accent font-medium' : 'text-brand-muted hover:text-white'
                  )}
                >
                  All
                </button>
                {categories?.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setParam('category', cat.slug)}
                    className={clsx(
                      'block w-full text-left text-sm py-1.5 transition-colors',
                      category === cat.slug ? 'text-brand-accent font-medium' : 'text-brand-muted hover:text-white'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-4">Sort By</h3>
              <div className="space-y-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setParam('sort', opt.value)}
                    className={clsx(
                      'block w-full text-left text-sm py-1.5 transition-colors',
                      sort === opt.value ? 'text-brand-accent font-medium' : 'text-brand-muted hover:text-white'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filters */}
            {(category || search) && (
              <div>
                <h3 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-3">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {category && (
                    <span className="tag flex items-center gap-1">
                      {category}
                      <button onClick={() => setParam('category', '')}><X size={10} /></button>
                    </span>
                  )}
                  {search && (
                    <span className="tag flex items-center gap-1">
                      "{search}"
                      <button onClick={() => setParam('search', '')}><X size={10} /></button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {/* Mobile sort */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <button
              onClick={() => setFilterOpen(o => !o)}
              className="flex items-center gap-2 text-sm"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <select
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
              className="text-sm bg-brand-card border-brand-border px-3 py-1.5"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-brand-card animate-pulse" />
              ))}
            </div>
          ) : data?.items?.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-4xl text-brand-muted mb-4">NO PRODUCTS FOUND</p>
              <p className="text-brand-muted text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data?.items?.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setParam('page', String(p))}
                  className={clsx(
                    'w-9 h-9 font-mono text-xs transition-colors',
                    page === p
                      ? 'bg-brand-accent text-brand-black'
                      : 'border border-brand-border text-brand-muted hover:border-white hover:text-white'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
