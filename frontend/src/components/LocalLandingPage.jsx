import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Truck, RotateCcw, ShieldCheck, Star } from 'lucide-react'
import { productAPI, getImageUrl } from '@/utils/api'
import ProductCard from '@/components/product/ProductCard'
import SEOHead from '@/components/seo/SEOHead'

// ── Town configuration ────────────────────────────────────────────────────────
// Each location page passes a `config` prop with all the town-specific details
// so this single component handles all 5 pages (DRY & consistent).
// ──────────────────────────────────────────────────────────────────────────────

const USP_ITEMS = [
  { icon: Truck, label: 'Free Delivery', sub: 'On orders above ₹499' },
  { icon: ShieldCheck, label: 'COD Available', sub: 'Pay when you receive' },
  { icon: RotateCcw, label: '7-Day Returns', sub: 'Hassle-free policy' },
  { icon: Star, label: '240 GSM Cotton', sub: 'Premium quality' },
]

const REVIEWS = [
  { name: 'Karthik R.', town: 'Mannargudi', text: 'Got my oversized tee in 3 days. Quality is insane for the price!', rating: 5 },
  { name: 'Priya S.', town: 'Thiruvarur', text: 'Finally a brand that delivers to our district. Loved the acid wash tee.', rating: 5 },
  { name: 'Arun M.', town: 'Needamangalam', text: 'COD option made it super easy. Will order again.', rating: 5 },
]

export default function LocalLandingPage({ config }) {
  const {
    town,
    district = 'Thiruvarur',
    slug,
    title,
    description,
    heroHeading,
    heroSubtitle,
    collegeNote,
    canonical,
    schema,
  } = config

  const { data: featured } = useQuery({
    queryKey: ['featured-products', 'landing'],
    queryFn: () => productAPI.list({ featured: true, per_page: 8 }).then(r => r.data),
  })

  const { data: oversized } = useQuery({
    queryKey: ['oversized', 'landing'],
    queryFn: () => productAPI.list({ category: 'oversized', per_page: 4 }).then(r => r.data),
  })

  const buildLocationFAQ = (town, district) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How long does delivery take to ${town}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Delivery to ${town} and surrounding areas in ${district} usually takes 3-6 business days via our reliable courier partners.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Is Cash on Delivery (COD) available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, we offer Cash on Delivery for all orders in ${town}. You can also pay online via Razorpay for faster processing.`,
        },
      },
      {
        '@type': 'Question',
        name: 'What is the return policy for local orders?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We have a hassle-free 7-day return policy. If the product doesn\'t meet your expectations, you can return it within 7 days of delivery.',
        },
      },
    ],
  })

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonical={canonical}
        schema={[schema, buildLocationFAQ(town, district)]}
      />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative bg-brand-card border-b border-brand-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="page-container py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 font-mono text-xs text-brand-accent tracking-[0.2em] uppercase mb-5">
              <MapPin size={12} />
              <span>Delivering to {town}, {district} District · Tamil Nadu</span>
            </div>
            <h1 className="font-display text-[clamp(44px,7vw,88px)] leading-none tracking-wider text-brand-white mb-6">
              {heroHeading}
            </h1>
            <p className="font-body text-brand-muted text-lg leading-relaxed mb-8 max-w-xl">
              {heroSubtitle}
            </p>
            {collegeNote && (
              <p className="font-mono text-xs text-brand-accent/80 border border-brand-accent/20 inline-block px-4 py-2 mb-8">
                🎓 {collegeNote}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary flex items-center gap-2">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/shop?category=oversized" className="btn-outline">
                Oversized Tees
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────────────── */}
      <section className="border-b border-brand-border bg-brand-black">
        <div className="page-container py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {USP_ITEMS.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={20} className="text-brand-accent shrink-0" />
              <div>
                <p className="font-body font-semibold text-sm text-brand-white">{label}</p>
                <p className="font-mono text-[10px] text-brand-muted">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERNAL LINKING: SHOP BY CATEGORY ────────────────────────── */}
      <section className="py-12 bg-black border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="font-mono text-[10px] text-brand-accent uppercase tracking-widest mb-6 text-center">✦ Quick Shop Tamil Nadu</h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              { label: 'Oversized Tees', slug: 'oversized', count: '10+' },
              { label: 'Printed Graphic Tees', slug: 'printed', count: '15+' },
              { label: 'Plain Essentials', slug: 'plain', count: '5+' },
              { label: 'Acid Wash Streetwear', slug: 'acid-wash', count: '3+' },
              { label: 'Premium Polo Tees', slug: 'polo', count: '4+' },
              { label: 'Trending Crop Tops', slug: 'crop', count: '2+' }
            ].map(cat => (
              <Link 
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="group flex items-center gap-3 border border-brand-border/50 hover:border-brand-accent p-4 bg-brand-card/30 transition-all duration-300"
              >
                <div className="text-left">
                  <p className="font-display text-lg tracking-wide group-hover:text-brand-accent transition-colors">{cat.label}</p>
                  <p className="font-mono text-[10px] text-brand-muted uppercase tracking-[2px]">{cat.count} Designs Delivery to {town}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="mb-10">
          <p className="font-mono text-xs text-brand-accent tracking-widest uppercase mb-2">
            ✦ Top picks for {town}
          </p>
          <h2 className="font-display text-4xl md:text-5xl tracking-wider">
            FEATURED<br />
            <span className="text-brand-muted">DROPS</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {featured?.items?.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="text-center">
          <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
            View All Products <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── OVERSIZED TEES SECTION ────────────────────────────────────── */}
      <section className="bg-brand-card border-y border-brand-border">
        <div className="page-container py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-xs text-brand-accent tracking-widest uppercase mb-2">
                Most popular in {town}
              </p>
              <h2 className="font-display text-4xl tracking-wider">OVERSIZED<br /><span className="text-brand-muted">COLLECTION</span></h2>
            </div>
            <Link to="/shop?category=oversized" className="btn-ghost hidden md:flex items-center gap-2 text-sm">
              Shop All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {oversized?.items?.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCAL DELIVERY INFO ───────────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs text-brand-accent tracking-widest uppercase mb-3">
              ✦ Shipping to {town}
            </p>
            <h2 className="font-display text-4xl tracking-wider mb-6">
              WE DELIVER TO<br />
              <span className="text-brand-accent">{town.toUpperCase()}</span>
            </h2>
            <div className="space-y-4 font-body text-brand-muted text-sm leading-relaxed">
              <p>
                Ashtrix Tees ships to <strong className="text-brand-white">{town}</strong> and the entire {district} district, including Mannargudi, Needamangalam, Kodavasal, Vedaranyam, and Papanasam.
              </p>
              <p>
                <strong className="text-brand-white">Delivery time:</strong> 3–6 business days via Speed Post / Delhivery.
              </p>
              <p>
                <strong className="text-brand-white">Cash on Delivery</strong> available for all orders. Free shipping on orders above ₹499.
              </p>
              <p>
                Not happy? Our <strong className="text-brand-white">7-day return policy</strong> means zero risk.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary flex items-center gap-2">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/shop?category=oversized" className="btn-outline">
                Oversized Tees ₹299+
              </Link>
            </div>
          </div>

          {/* ── Why us ── */}
          <div className="border border-brand-border p-8 bg-brand-card">
            <h3 className="font-display text-2xl tracking-wider mb-6">WHY ASHTRIX TEES?</h3>
            <div className="space-y-5">
              {[
                ['🎽', '240 GSM Cotton', 'Won\'t go transparent after one wash. Premium weight, premium feel.'],
                ['💰', 'Starting ₹299', 'Real streetwear quality without the Myntra markup.'],
                ['🏠', 'Tamil Nadu Brand', 'Born in Thruthuraipoondi. We know this district.'],
                ['📦', 'COD + Free Returns', 'Order with zero risk. Pay on delivery.'],
                ['📏', 'XS to 3XL', 'Every size stocked. Every body covered.'],
              ].map(([icon, title, desc]) => (
                <div key={title} className="flex gap-4">
                  <span className="text-2xl shrink-0">{icon}</span>
                  <div>
                    <p className="font-body font-semibold text-sm text-brand-white">{title}</p>
                    <p className="font-body text-xs text-brand-muted mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ──────────────────────────────────────────── */}
      <section className="bg-brand-card border-t border-brand-border">
        <div className="page-container py-16">
          <p className="font-mono text-xs text-brand-accent tracking-widest uppercase mb-2">✦ What customers say</p>
          <h2 className="font-display text-4xl tracking-wider mb-10">
            REAL<br /><span className="text-brand-muted">REVIEWS</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {REVIEWS.map(r => (
              <div key={r.name} className="border border-brand-border p-6 bg-brand-black">
                <div className="flex mb-3">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-brand-accent fill-brand-accent" />
                  ))}
                </div>
                <p className="font-body text-sm text-brand-muted leading-relaxed mb-4">"{r.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-accent/20 flex items-center justify-center font-display text-sm text-brand-accent">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="font-body text-xs font-semibold text-brand-white">{r.name}</p>
                    <p className="font-mono text-[10px] text-brand-muted">{r.town}, Tamil Nadu</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="border-t border-brand-border">
        <div className="page-container py-20 text-center">
          <p className="font-mono text-xs text-brand-accent tracking-[0.3em] uppercase mb-4">
            ✦ Free delivery to {town} above ₹499
          </p>
          <h2 className="font-display text-[clamp(40px,6vw,72px)] leading-none tracking-wider mb-6">
            YOUR NEXT<br />
            <span className="text-brand-accent">FAVOURITE TEE</span><br />
            IS ONE CLICK AWAY
          </h2>
          <p className="font-body text-brand-muted mb-8 max-w-md mx-auto">
            Starting ₹299. Premium 240 GSM cotton. Delivered to {town} in 3–6 days. COD available.
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      {/* ── CROSS-LINKING: NEARBY HUBS ────────────────────────────────── */}
      <section className="py-16 bg-brand-card border-t border-brand-border">
        <div className="page-container flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h4 className="font-display text-2xl tracking-wide mb-2 uppercase">Nearby Delivery <span className="text-brand-muted">Hubs</span></h4>
            <p className="text-sm text-brand-muted font-mono tracking-tight">Shopping from a nearby town? We deliver across Thiruvarur District.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-3">
            {[
              { name: 'Thiruvarur', path: '/tshirts-in-thiruvarur' },
              { name: 'Mannargudi', path: '/tshirts-delivery-mannargudi' },
              { name: 'Needamangalam', path: '/buy-tshirts-needamangalam' },
              { name: 'Kodavasal', path: '/tshirts-kodavasal' },
              { name: 'Vedaranyam', path: '/tshirts-vedaranyam' }
            ].filter(hub => hub.name !== town).map(hub => (
              <Link 
                key={hub.path} 
                to={hub.path} 
                className="px-4 py-2 border border-brand-border hover:border-brand-accent hover:text-brand-accent text-xs font-mono uppercase transition-colors"
              >
                {hub.name} →
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
