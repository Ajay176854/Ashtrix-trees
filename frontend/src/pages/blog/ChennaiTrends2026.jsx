import React from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';

const ChennaiTrends2026 = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What are the latest streetwear trends in Chennai for 2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For 2026, Chennai's streetwear scene is focused on 'Heavy Minimalism'—240 GSM oversized tees in neutral tones, paired with wide-leg utility pants."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I find trending streetwear brands in Chennai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While there are many retail hubs like T-Nagar and Nungambakkam, online-first brands like Ashtrix Tees are providing the most sought-after drops with direct shipping to all Chennai pincodes."
        }
      }
    ]
  };

  return (
    <div className="bg-black text-white min-h-screen font-body">
      <SEOHead 
        title="Streetwear Trends in Chennai 2026 | Local Fashion Guide | Ashtrix Tees"
        description="Discover the hottest streetwear trends in Chennai for 2026. From oversized boxy fits to Tamil-culture graphic drops, see what's trending in the city."
        schema={faqSchema}
      />

      <article className="max-w-4xl mx-auto px-6 py-20">
        <Link to="/blog" className="inline-flex items-center gap-2 text-brand-accent mb-12 hover:gap-4 transition-all">
          <ArrowLeft size={16} /> Back to Assets
        </Link>

        <header className="mb-16">
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-none mb-8">
            CHENNAI FLASH:<br />
            <span className="text-brand-accent">STREETWEAR TRENDS</span><br />
            FOR 2026
          </h1>
          <div className="flex items-center gap-4 text-xs font-mono text-brand-muted uppercase tracking-widest">
            <span>Trend Report</span>
            <span>•</span>
            <span>8 Min Read</span>
            <span>•</span>
            <span>March 27, 2026</span>
          </div>
        </header>

        <div className="prose prose-invert prose-brand max-w-none text-brand-muted leading-relaxed space-y-8">
          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">A New Era of Style in the Gateway to South India</h2>
            <p>
              Chennai has always been a city of traditions, but the "New Madras" aesthetic of 2026 is blending that heritage with global streetwear influences. The hallmark of this year? **Comfort-First Construction.**
            </p>
          </section>

          <div className="border border-brand-border p-10 bg-brand-card flex flex-col items-center text-center">
            <TrendingUp size={48} className="text-brand-accent mb-6" />
            <h3 className="font-display text-3xl mb-4 text-brand-white uppercase">TOP TREND: HEAVYWEIGHT MINIMALISM</h3>
            <p className="max-w-2xl mx-auto mb-6">
              Forget loud logos. In 2026, the trend is about the weight of the fabric and the precision of the fit. Neutral tones like bone white, charcoal, and moss green are the city's favorite palette.
            </p>
            <Link to="/shop?category=plain" className="btn-primary">Shop The Neutral Collection</Link>
          </div>

          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">Why Chennai Chooses Ashtrix</h2>
            <p>
              Whether you're chilling at Besant Nagar beach or exploring the malls of Velachery, our 240 GSM Combed Cotton ensures you stay comfortable. Unlike synthetic blends, our 100% natural fibers handle Chennai's humidity with ease.
            </p>
            <p>
              We pride ourselves on being a Tamil Nadu brand. Every drop is inspired by the vibrant pulse of our cities and the quiet confidence of our people.
            </p>
          </section>

          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">Chennai Trend FAQ</h2>
            <div className="space-y-6">
              {faqSchema.mainEntity.map((item, index) => (
                <div key={index} className="border-b border-brand-border pb-6">
                  <h4 className="text-brand-white font-display text-lg mb-2 uppercase">{item.name}</h4>
                  <p className="text-sm">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
};

export default ChennaiTrends2026;
