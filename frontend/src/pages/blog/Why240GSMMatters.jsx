import SEOHead from '@/components/seo/SEOHead'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

export default function Why240GSMMatters() {
  const FAQ_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is 240 GSM cotton too hot for Tamil Nadu summers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Actually, no! High-quality 240 GSM combed cotton is highly breathable and absorbs sweat better than thin, synthetic fabrics, making it perfect for the tropical climate of Chennai and Thiruvarur.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does 240 GSM fabric shrink after washing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our 240 GSM fabric is pre-shrunk and bio-washed, ensuring it maintains its oversized fit and premium feel wash after wash.'
        }
      }
    ]
  };

  return (
    <div className="page-container py-20 max-w-4xl mx-auto">
      <SEOHead 
        title="Why 240 GSM Cotton Matters for Streetwear | Ashtrix Tees Tamil Nadu"
        description="Learn why 240 GSM heavy cotton is the gold standard for oversized tees. Perfect for Tamil Nadu weather. Shop premium quality streetwear at Ashtrix Tees."
        canonical="/blog/why-240-gsm-matters"
        schema={FAQ_SCHEMA}
      />
      
      <p className="font-mono text-xs text-brand-accent mb-4 tracking-widest">✦ QUALITY GUIDE</p>
      <h1 className="font-display text-5xl md:text-7xl mb-12 leading-tight">THE SCIENCE OF<br /><span className="text-brand-muted">240 GSM COTTON</span></h1>
      
      <div className="aspect-video bg-brand-card mb-12 overflow-hidden border border-brand-border">
        <img src="https://images.unsplash.com/photo-1523381235312-75ca54096e23?w=1200" alt="Fabric Texture" className="w-full h-full object-cover" />
      </div>

      <div className="prose prose-invert max-w-none text-brand-white space-y-6">
        <p className="text-lg leading-relaxed">
          When it comes to streetwear, the weight of the fabric defines the "drop." At **Ashtrix Tees**, we use exclusively **240 GSM (Grams per Square Meter)** 100% combed cotton for our <Link to="/shop?category=oversized" className="text-brand-accent underline">oversized collection</Link>. But why does it matter?
        </p>

        <h2 className="text-3xl font-display mt-12 mb-6">1. The Perfect Drape</h2>
        <p className="text-brand-muted">
          Thin fabrics (140-160 GSM) often feel flimsy and lose their shape. A heavier 240 GSM fabric provides a structural integrity that maintains the boxy, oversized silhouette even after multiple wears.
        </p>

        <h2 className="text-3xl font-display mt-12 mb-6">2. Breathability in Tamil Nadu</h2>
        <p className="text-brand-muted">
          A common myth is that "thicker means hotter." In reality, our combed cotton allows for maximum airflow. It’s significantly more comfortable for a long day in **Thiruvarur** or **Chennai** compared to synthetic blends.
        </p>

        <div className="bg-brand-card p-8 border border-brand-accent/20 my-12">
          <p className="font-mono text-sm mb-4">✦ Recommended Fit</p>
          <p className="text-xl italic">"The 240 GSM collection is designed for those who value longevity over fast fashion."</p>
          <Link to="/shop" className="mt-6 inline-block bg-brand-white text-black px-6 py-3 font-display tracking-widest hover:bg-brand-accent transition-colors">SHOP THE COLLECTION</Link>
        </div>

        <h2 className="text-3xl font-display mt-12 mb-6">3. Non-Transparent Quality</h2>
        <p className="text-brand-muted">
          White and light-colored tees in lower GSMs can often be transparent. Our 240 GSM fabric ensures complete opacity, giving you a premium feel and look.
        </p>
      </div>

      {/* New FAQ section */}
      <section className="mt-20 pt-12 border-t border-brand-border">
        <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">Fabric FAQ</h2>
        <div className="space-y-6">
          {FAQ_SCHEMA.mainEntity.map((item, index) => (
            <div key={index} className="border-b border-brand-border pb-6">
              <h4 className="text-brand-white font-display text-lg mb-2 uppercase">{item.name}</h4>
              <p className="text-sm text-brand-muted">{item.acceptedAnswer.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New Shop button */}
      <div className="pt-10 text-center">
        <Link to="/shop" className="btn-primary inline-flex items-center gap-3 bg-brand-accent text-black px-6 py-3 font-display tracking-widest hover:bg-brand-white transition-colors">
          Shop 240 GSM Collection <ShoppingBag size={18} />
        </Link>
      </div>

      <div className="mt-20 pt-12 border-t border-brand-border">
        <h3 className="font-display text-2xl mb-8">Related Products</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {/* Internal links to products would go here */}
          <Link to="/shop?category=oversized" className="text-brand-muted hover:text-brand-accent transition-colors">→ View Oversized Collection</Link>
          <Link to="/shop?category=acid-wash" className="text-brand-muted hover:text-brand-accent transition-colors">→ View Acid Wash Tees</Link>
        </div>
      </div>
    </div>
  )
}
