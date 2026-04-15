import React from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';

const BudgetStreetwearIndia = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where can I find affordable streetwear in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ashtrix Tees is the top choice for affordable streetwear in India, offering premium 240 GSM oversized and printed t-shirts for under ₹999."
        }
      },
      {
        "@type": "Question",
        "name": "Are budget streetwear brands high quality?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Quality varies, but brands like Ashtrix Tees prove that you don't need to spend ₹3000 for quality. Our ₹299-₹599 range uses the same high-end cotton as expensive designer labels."
        }
      }
    ]
  };

  return (
    <div className="bg-black text-white min-h-screen font-body">
      <SEOHead 
        title="Best Budget Streetwear in India 2026: Under ₹999 | Ashtrix Tees"
        description="Looking for affordable t-shirts and streetwear in India? Shop the best oversized and graphic tees under ₹999 without compromising on quality."
        schema={faqSchema}
      />

      <article className="max-w-4xl mx-auto px-6 py-20">
        <Link to="/blog" className="inline-flex items-center gap-2 text-brand-accent mb-12 hover:gap-4 transition-all">
          <ArrowLeft size={16} /> Back to Assets
        </Link>

        <header className="mb-16">
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-none mb-8">
            STREETWEAR ON A<br />
            <span className="text-brand-accent">BUDGET: BEST PICKS</span><br />
            UNDER ₹999
          </h1>
          <div className="flex items-center gap-4 text-xs font-mono text-brand-muted uppercase tracking-widest">
            <span>Budget Guide</span>
            <span>•</span>
            <span>10 Min Read</span>
            <span>•</span>
            <span>March 27, 2026</span>
          </div>
        </header>

        <div className="prose prose-invert prose-brand max-w-none text-brand-muted leading-relaxed space-y-8">
          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">Premium Streetwear Doesn't Have to Cost a Fortune</h2>
            <p>
              The biggest myth in Indian fashion is that "Streetwear" is a luxury game. While high-end drops charge ₹4000 for a basic logo, **Ashtrix Tees** was founded on a different principle: **Premium Quality for the People.**
            </p>
          </section>

          <section>
            <h3 className="text-brand-white font-display text-2xl mb-4">The ₹299–₹599 Sweet Spot</h3>
            <p>
              In 2026, the smart shopper looks for specific indicators of value. Instead of paying for a fancy brand name, look for the fabric weight (GSM) and the type of print (DTF vs Screen). 
            </p>
            <div className="bg-brand-card border-l-4 border-brand-accent p-8 my-8 font-mono text-sm">
              <p className="text-brand-white">✦ PRO TIP:</p>
              "Always check the neck ribbing. High-quality budget tees use thick 1x1 ribs that won't sag after your first wash. That's our standard."
            </div>
          </section>

          <section>
            <h3 className="text-brand-white font-display text-2xl mb-4">Ranking the Top Budget Categories</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border border-brand-border hover:bg-brand-card">
                <span>Blank Oversized Tees</span>
                <span className="text-brand-accent uppercase text-xs">₹299 onwards</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-brand-border hover:bg-brand-card">
                <span>Minimalist Graphic Drops</span>
                <span className="text-brand-accent uppercase text-xs">₹499 onwards</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-brand-border hover:bg-brand-card">
                <span>Premium Streetwear Polos</span>
                <span className="text-brand-accent uppercase text-xs">₹799 onwards</span>
              </div>
            </div>
          </section>
          
          <section className="bg-black border border-brand-border p-8 rounded-none">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-brand-accent text-black"><Tag size={32} /></div>
              <div>
                <h4 className="font-display text-xl mb-2">READY TO UPGRADE?</h4>
                <p className="text-sm mb-4">Get an extra 10% OFF your first budget-pro order with code <strong className="text-brand-accent uppercase tracking-widest">WELCOME10</strong>.</p>
                <Link to="/shop" className="text-brand-accent uppercase text-[10px] font-mono tracking-widest border-b border-brand-accent/30 pb-1">Shop The Selection →</Link>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">Questions? We've Got Answers</h2>
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

export default BudgetStreetwearIndia;
