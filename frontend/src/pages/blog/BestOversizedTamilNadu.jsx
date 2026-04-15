import React from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const BestOversizedTamilNadu = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where can I buy the best oversized t-shirts in Tamil Nadu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ashtrix Tees offers the best premium oversized t-shirts in Tamil Nadu, featuring 240 GSM heavy cotton and modern boxy fits. We ship across the state, including Chennai, Thiruvarur, and Coimbatore."
        }
      },
      {
        "@type": "Question",
        "name": "What is the price of oversized t-shirts at Ashtrix Tees?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our premium oversized collection starts at just ₹299, making it one of the most affordable yet high-quality options in the Indian streetwear market."
        }
      }
    ]
  };

  return (
    <div className="bg-black text-white min-h-screen font-body">
      <SEOHead 
        title="Best Oversized T-Shirts in Tamil Nadu (2026 Guide) | Ashtrix Tees"
        description="Looking for the best oversized t-shirts in Tamil Nadu? Discover why 240 GSM heavy cotton and boxy fits are dominating the Chennai streetwear scene."
        schema={faqSchema}
      />

      <article className="max-w-4xl mx-auto px-6 py-20">
        <Link to="/blog" className="inline-flex items-center gap-2 text-brand-accent mb-12 hover:gap-4 transition-all">
          <ArrowLeft size={16} /> Back to Assets
        </Link>

        <header className="mb-16">
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-none mb-8">
            BEST OVERSIZED<br />
            <span className="text-brand-accent">T-SHIRTS IN</span><br />
            TAMIL NADU
          </h1>
          <div className="flex items-center gap-4 text-xs font-mono text-brand-muted uppercase tracking-widest">
            <span>By Ashtrix Editorial</span>
            <span>•</span>
            <span>12 Min Read</span>
            <span>•</span>
            <span>March 27, 2026</span>
          </div>
        </header>

        <div className="prose prose-invert prose-brand max-w-none text-brand-muted leading-relaxed space-y-8">
          <p className="text-xl text-brand-white leading-normal italic">
            "Streetwear isn't just about the brand; it's about the drape, the weight, and the silent status of a perfect boxy fit."
          </p>

          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">The Rise of Streetwear in Tamil Nadu</h2>
            <p>
              In the last few years, the fashion landscape of Tamil Nadu—from the bustling streets of Mount Road in Chennai to the cultural hubs of Thiruvarur—has seen a massive shift. The traditional slim-fit tee is out. The <strong>oversized revolution</strong> is in.
            </p>
            <p>
              But not all oversized tees are created equal. In a tropical climate like ours, the fabric choice determines whether your 'fit stays fresh or becomes a sweaty burden. This is where the 240 GSM heavy cotton standard changes the game.
            </p>
          </section>

          <section className="bg-brand-card p-10 border border-brand-border">
            <h3 className="text-brand-white font-display text-2xl mb-4">Quick Shop: Trending Tamil Nadu Picks</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-brand-border/50 p-6 bg-black/40">
                <p className="font-mono text-brand-accent text-[10px] mb-2">✦ BESTSELLER</p>
                <h4 className="font-display text-lg mb-4 text-brand-white">Classic Plain Oversized</h4>
                <Link to="/shop?category=oversized" className="btn-outline text-xs">Shop Collection</Link>
              </div>
              <div className="border border-brand-border/50 p-6 bg-black/40">
                <p className="font-mono text-brand-accent text-[10px] mb-2">✦ TRENDING</p>
                <h4 className="font-display text-lg mb-4 text-brand-white">Graphic Printed Streetwear</h4>
                <Link to="/shop?category=printed" className="btn-outline text-xs">View Designs</Link>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">Why Local Matters for Streetwear</h2>
            <p>
              When you buy from a homegrown Tamil Nadu brand like **Ashtrix Tees**, you're not just supporting local artisans; you're getting a product designed for the local environment. Our tees are pre-shrunk and treated to handle the humidity of Chennai and the heat of Madurai without losing their structural integrity.
            </p>
            <p>
              Our "Oversized" isn't just "Big". It's a calculated **Boxy Fit**—dropped shoulders, wider sleeves, and a length that hits exactly at the waistline, avoiding the 'baggy nightgown' look that plagues cheaper alternatives.
            </p>
          </section>

          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqSchema.mainEntity.map((item, index) => (
                <div key={index} className="border-b border-brand-border pb-6">
                  <h4 className="text-brand-white font-display text-lg mb-2 uppercase">{item.name}</h4>
                  <p className="text-sm">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>
          
          <div className="pt-10 text-center">
            <Link to="/shop" className="btn-primary inline-flex items-center gap-3">
              Explore Our Full Collection <ShoppingBag size={18} />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BestOversizedTamilNadu;
