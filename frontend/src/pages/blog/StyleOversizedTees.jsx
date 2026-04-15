import React from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

const StyleOversizedTees = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How should an oversized t-shirt fit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An oversized t-shirt should have a 'boxy' drape. Look for dropped shoulders where the seam sits past the natural shoulder line, and a width that allows for breathability without looking like a nightgown. The length should ideally hit just below the belt line."
        }
      },
      {
        "@type": "Question",
        "name": "What pants go best with oversized tees?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To balance the proportions, pair oversized tees with baggy cargo pants, straight-leg denim, or relaxed-fit chinos. Avoid skin-tight jeans as they create an unbalanced 'mismatch' in volume."
        }
      }
    ]
  };

  return (
    <div className="bg-black text-white min-h-screen font-body">
      <SEOHead 
        title="How to Style Oversized Tees: The 2026 Streetwear Guide | Ashtrix Tees"
        description="Master the art of the oversized fit. From layering tips to choosing the right accessories, our 2026 guide shows you how to rock the boxy look."
        schema={faqSchema}
      />

      <article className="max-w-4xl mx-auto px-6 py-20">
        <Link to="/blog" className="inline-flex items-center gap-2 text-brand-accent mb-12 hover:gap-4 transition-all">
          <ArrowLeft size={16} /> Back to Assets
        </Link>

        <header className="mb-16">
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-none mb-8">
            STYLE GUIDE:<br />
            <span className="text-brand-accent">THE ART OF</span><br />
            OVERSIZED FITS
          </h1>
          <div className="flex items-center gap-4 text-xs font-mono text-brand-muted uppercase tracking-widest">
            <span>Style Series</span>
            <span>•</span>
            <span>10 Min Read</span>
            <span>•</span>
            <span>March 27, 2026</span>
          </div>
        </header>

        <div className="prose prose-invert prose-brand max-w-none text-brand-muted leading-relaxed space-y-8">
          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">The Proportions of Streetwear</h2>
            <p>
              In 2026, styling isn't about hiding your body; it's about playing with **volume and silhouette**. The oversized t-shirt is the foundational piece of this visual language.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8 my-10">
            <div className="p-8 border border-brand-border bg-brand-card/30">
              <h3 className="text-brand-white font-display text-xl mb-4 uppercase tracking-widest">The "Tuck" Rule</h3>
              <p className="text-sm">A partial front-tuck (the 'French tuck') can help define your waistline if the tee length feels too long. It breaks the vertical line and adds a rugged, effortless vibe.</p>
            </div>
            <div className="p-8 border border-brand-border bg-brand-card/30">
              <h3 className="text-brand-white font-display text-xl mb-4 uppercase tracking-widest">Layering Logic</h3>
              <p className="text-sm">Wear an oversized tee over a fitted long-sleeved shirt for a classic 90s skater look, or under an open utility jacket for a modern urban fit.</p>
            </div>
          </section>

          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">Accessorizing the Fit</h2>
            <p>
              Because oversized tees provide a large 'canvas', they pair perfectly with bold jewelry. A single silver chain or a heavy watch can elevate a plain oversized tee from 'loungewear' to 'streetwear'.
            </p>
          </section>

          <div className="bg-brand-card border border-brand-border p-10 text-center my-12">
            <Sparkles size={32} className="text-brand-accent mx-auto mb-4" />
            <h4 className="font-display text-2xl text-brand-white mb-2 uppercase">Ready to Start?</h4>
            <p className="text-sm mb-6">Our 240 GSM oversized tees provide the perfect structure for these style tips.</p>
            <Link to="/shop?category=oversized" className="btn-primary">Shop The Oversized Drop</Link>
          </div>

          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">Styling FAQ</h2>
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

export default StyleOversizedTees;
