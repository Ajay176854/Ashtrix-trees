import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import { productAPI, bannerAPI, categoryAPI, getImageUrl } from '@/utils/api'
import ProductCard from '@/components/product/ProductCard'
import SEOHead from '@/components/seo/SEOHead'

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ashtrix Tees',
  url: 'https://ashtrixtees.com',
  logo: 'https://ashtrixtees.com/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-XXXXXXXXXX',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['en', 'Tamil'],
  },
  sameAs: [
    'https://www.instagram.com/ashtrixtees',
    'https://www.facebook.com/ashtrixtees',
  ],
}

const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Ashtrix Tees',
  description: 'Premium oversized, printed & plain t-shirts. 240 GSM cotton. Free shipping above ₹499.',
  url: 'https://ashtrixtees.com',
  telephone: '+91-XXXXXXXXXX',
  priceRange: '₹299 - ₹999',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Thruthuraipoondi',
    addressLocality: 'Thruthuraipoondi',
    addressRegion: 'Tamil Nadu',
    postalCode: '614713',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '10.5765',
    longitude: '79.6232',
  },
  areaServed: [
    'Thiruvarur', 'Mannargudi', 'Needamangalam', 'Kodavasal',
    'Vedaranyam', 'Papanasam', 'Tamil Nadu',
  ],
  hasMap: 'https://maps.google.com/?q=Thruthuraipoondi,Tamil+Nadu',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    opens: '09:00',
    closes: '20:00',
  },
}

const HOME_SCHEMA = [ORGANIZATION_SCHEMA, LOCAL_BUSINESS_SCHEMA]


export default function HomePage() {
  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerAPI.list().then(r => r.data),
  })

  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productAPI.list({ featured: true, per_page: 8 }).then(r => r.data),
  })

  const { data: newArrivals } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productAPI.list({ per_page: 4, sort: 'newest' }).then(r => r.data),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.list().then(r => r.data),
  })

  const heroBanner = banners?.[0]

  const categoryImages = {
    oversized: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600',
    printed: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
    plain: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=600',
    'acid-wash': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600',
    polo: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
    crop: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
  }

  return (
    <div>
      <SEOHead
        title="Best Premium T-Shirts Online Under ₹999 | Ashtrix Tees Tamil Nadu"
        description="🔥 Top-rated oversized, printed & plain tees starting at just ₹299! Premium 240 GSM cotton. Free shipping above ₹499. Shop the hottest streetwear in Thiruvarur & Tamil Nadu."
        canonical="/"
        schema={HOME_SCHEMA}
      />
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        <img
          src={getImageUrl(heroBanner?.image)}
          alt="Ashtrix Tees – Premium T-Shirts Collection SS25, Thruthuraipoondi Tamil Nadu"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/20 via-transparent to-brand-black/80" />

        <div className="relative h-full flex flex-col justify-end page-container pb-16">
          <div className="max-w-2xl animate-fade-up">
            <p className="font-mono text-xs text-brand-accent tracking-[0.3em] uppercase mb-4">
              ✦ New Collection SS25
            </p>
            <h1 className="font-display text-[clamp(60px,10vw,120px)] leading-none tracking-wider text-brand-white mb-6">
              {heroBanner?.title || 'WEAR THE\nVIBE'}
            </h1>
            <p className="font-body text-brand-white/70 text-lg mb-8 leading-relaxed">
              {heroBanner?.subtitle || 'Premium 240GSM cotton tees. Oversized, printed, and always fresh. Delivering to Thiruvarur district & across Tamil Nadu.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary flex items-center gap-2">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/shop?category=oversized" className="btn-outline">
                Oversized Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Stats ticker */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="page-container py-3 flex items-center justify-between">
            {[
              ['300+', 'Styles'],
              ['240 GSM', 'Premium Cotton'],
              ['₹299', 'Starting at'],
              ['Free Ship', 'Above ₹499'],
            ].map(([val, label]) => (
              <div key={val} className="text-center px-4">
                <p className="font-display text-xl text-brand-accent tracking-wider">{val}</p>
                <p className="font-mono text-[10px] text-white/50 tracking-widest uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────── */}
      <section className="border-y border-brand-border py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array(8).fill('FRESH FITS ✦ OVERSIZED TEES ✦ GRAPHIC PRINTS ✦ ACID WASH ✦ FREE SHIPPING ✦ COD AVAILABLE ✦ PREMIUM COTTON ✦').map((t, i) => (
            <span key={i} className="font-display text-2xl tracking-widest text-brand-muted mx-8">{t}</span>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="page-container py-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="section-title text-brand-white">SHOP BY<br /><span className="text-brand-accent">STYLE</span></h2>
          <Link to="/shop" className="btn-ghost flex items-center gap-2 hidden md:flex">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(categories || []).map((cat, i) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative aspect-[2/3] overflow-hidden bg-brand-card"
            >
              <img
                src={getImageUrl(cat.image || categoryImages[cat.slug])}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-display text-lg tracking-wider text-white">{cat.name.toUpperCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────── */}
      <section className="page-container py-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-xs text-brand-accent tracking-widest uppercase mb-2">✦ Curated picks</p>
            <h2 className="section-title">FEATURED<br /><span className="text-brand-muted">DROPS</span></h2>
          </div>
          <Link to="/shop?featured=true" className="btn-outline hidden md:inline-flex items-center gap-2">
            See All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured?.items?.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ── FULL-WIDTH BANNER ────────────────────────────────── */}
      <section className="my-16 relative h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1400&q=80"
          alt="Promo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-center">
          <p className="font-mono text-xs text-brand-accent tracking-[0.3em] uppercase mb-3">Limited Time</p>
          <h2 className="font-display text-6xl md:text-8xl tracking-wider text-white mb-6">
            FLAT ₹50 OFF
          </h2>
          <p className="font-body text-white/60 mb-8">Use code <span className="text-brand-accent font-mono font-bold">FLAT50</span> on orders above ₹299</p>
          <Link to="/shop" className="btn-primary flex items-center gap-2">
            <Zap size={14} /> Grab the Deal
          </Link>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────────── */}
      <section className="page-container py-8 pb-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="section-title">NEW<br /><span className="text-brand-accent">ARRIVALS</span></h2>
          <Link to="/shop?sort=newest" className="btn-ghost flex items-center gap-2">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newArrivals?.items?.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ── USP STRIP ────────────────────────────────────────── */}
      <section className="border-t border-brand-border bg-brand-card">
        <div className="page-container py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            ['🎽', 'Premium Fabric', '240 GSM combed cotton'],
            ['🚚', 'Free Shipping', 'On orders above ₹499'],
            ['🔄', 'Easy Returns', '7-day hassle-free returns'],
            ['🔒', 'Secure Checkout', 'Razorpay encrypted payments'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="flex flex-col items-center text-center gap-2">
              <span className="text-3xl">{icon}</span>
              <h4 className="font-body font-semibold text-sm">{title}</h4>
              <p className="font-body text-xs text-brand-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
