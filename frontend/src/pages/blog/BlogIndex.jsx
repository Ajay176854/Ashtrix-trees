import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'

const POSTS = [
  {
    title: 'How to Style Oversized Tees: The 2026 Guide',
    slug: 'blog/style-oversized-tees-2026',
    excerpt: 'Master the art of the oversized fit with our latest style guide focused on the Tamil Nadu streetwear scene.',
    date: '2026-03-27',
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800'
  },
  {
    title: 'Fabric Science: Why 240 GSM Matters',
    slug: 'blog/why-240-gsm-matters',
    excerpt: 'Everything you need to know about t-shirt weight, comfort, and durability in tropical weather.',
    date: '2026-03-20',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
  },
  {
    title: 'Best Oversized T-Shirts in Tamil Nadu (2026 Guide)',
    slug: 'blog/best-oversized-tshirts-tamil-nadu',
    excerpt: 'Looking for the best oversized t-shirts in Tamil Nadu? Discover why 240 GSM heavy cotton and boxy fits are dominating the Chennai scene.',
    date: '2026-03-25',
    image: 'https://images.unsplash.com/photo-1558191053-8edcb01e1da3?w=800'
  },
  {
    title: '240 GSM vs 180 GSM: The Heavyweight Battle',
    slug: 'blog/fabric-weight-comparison',
    excerpt: 'Confused between 240 GSM and 180 GSM? Our deep-dive guide compares weight, durability, and comfort for the perfect t-shirt experience.',
    date: '2026-03-23',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'
  },
  {
    title: 'Budget Streetwear in India: Top Picks Under ₹999',
    slug: 'blog/budget-streetwear-india',
    excerpt: 'Looking for affordable t-shirts and streetwear in India? Shop the best oversized and graphic tees under ₹999.',
    date: '2026-03-21',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800'
  },
  {
    title: 'Chennai Flash: Streetwear Trends for 2026',
    slug: 'blog/chennai-streetwear-trends-2026',
    excerpt: 'Discover the hottest streetwear trends in Chennai for 2026. From oversized boxy fits to Tamil-culture graphic drops.',
    date: '2026-03-19',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800'
  }
]

export default function BlogIndex() {
  return (
    <div className="page-container py-20">
      <SEOHead 
        title="Style Guide & Blog | Ashtrix Tees"
        description="Explore the latest streetwear trends, style guides, and fabric tips from Ashtrix Tees. From oversized fits to 240 GSM quality."
        canonical="/blog"
      />
      <div className="mb-12">
        <p className="font-mono text-xs text-brand-accent tracking-widest uppercase mb-2">✦ The Ashtrix Journal</p>
        <h1 className="font-display text-5xl md:text-7xl tracking-wider">STYLE<br /><span className="text-brand-muted">GUIDES</span></h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {POSTS.map(post => (
          <Link to={`/${post.slug}`} key={post.slug} className="group cursor-pointer">
            <div className="aspect-video overflow-hidden bg-brand-card mb-4">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="font-mono text-[10px] text-brand-muted uppercase mb-2">{post.date}</p>
            <h2 className="font-display text-2xl tracking-wide group-hover:text-brand-accent transition-colors mb-2">{post.title}</h2>
            <p className="text-sm text-brand-muted leading-relaxed mb-4">{post.excerpt}</p>
            <span className="text-xs font-mono text-brand-accent border-b border-brand-accent/30 pb-1">Read Asset →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
