import React from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const FabricComparison = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is 240 GSM better than 180 GSM for t-shirts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For oversized and streetwear fits, 240 GSM is superior. It provides a better drape, higher durability, and doesn't become transparent. 180 GSM is better for lightweight regular wear."
        }
      },
      {
        "@type": "Question",
        "name": "Does 240 GSM feel too hot in summer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Correctly treated 100% cotton 240 GSM fabric is actually very breathable. Its heavier weight allows it to 'stand off' the body, creating better airflow than clingy 180 GSM fabrics."
        }
      }
    ]
  };

  return (
    <div className="bg-black text-white min-h-screen font-body">
      <SEOHead 
        title="240 GSM vs 180 GSM: Which T-Shirt Fabric is Better? | Ashtrix Tees"
        description="Confused between 240 GSM and 180 GSM? Our deep-dive guide compares weight, durability, and comfort for the perfect t-shirt experience."
        schema={faqSchema}
      />

      <article className="max-w-4xl mx-auto px-6 py-20">
        <Link to="/blog" className="inline-flex items-center gap-2 text-brand-accent mb-12 hover:gap-4 transition-all">
          <ArrowLeft size={16} /> Back to Assets
        </Link>

        <header className="mb-16">
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-none mb-8 uppercase">
            THE WEIGHT<br />
            <span className="text-brand-accent">BATTLE: 240</span><br />
            VS 180 GSM
          </h1>
          <div className="flex items-center gap-4 text-xs font-mono text-brand-muted uppercase tracking-widest">
            <span>Tech Series</span>
            <span>•</span>
            <span>15 Min Read</span>
            <span>•</span>
            <span>March 27, 2026</span>
          </div>
        </header>

        <div className="prose prose-invert prose-brand max-w-none text-brand-muted leading-relaxed space-y-8">
          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">Understanding GSM in Clothing</h2>
            <p>
              GSM stands for **Grams per Square Meter**. It is the industry standard for measuring fabric weight. While most online brands hide their GSM to save on production costs, we believe transparency is the first step to premium streetwear.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8 my-10">
            <div className="p-8 border border-brand-border bg-brand-card/50">
              <h3 className="font-display text-2xl mb-4 text-brand-white">180 GSM</h3>
              <ul className="space-y-4 text-sm font-mono tracking-tight">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-muted" /> Lightweight / Base Layer</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-muted" /> Drapes closer to body</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-muted" /> Prone to losing shape</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-muted" /> Common in mass-market tees</li>
              </ul>
            </div>
            <div className="p-8 border border-brand-accent bg-brand-card">
              <h3 className="font-display text-2xl mb-4 text-brand-white">240 GSM (The Heavyweight)</h3>
              <ul className="space-y-4 text-sm font-mono tracking-tight">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-accent" /> Premium Boxy Fit</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-accent" /> High structural integrity</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-accent" /> Zero transparency</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-accent" /> Standard for Ashtrix Tees</li>
              </ul>
            </div>
          </div>

          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">The Verdict for Streetwear</h2>
            <p>
              If you are buying **Oversized T-Shirts**, 180 GSM is a mistake. Heavyweight fabrics like 240 GSM are essential to maintain that 'boxy' silhouette. Without weight, the fabric just hangs limp, defeating the purpose of the streetwear aesthetic.
            </p>
            <p>
              At **Ashtrix Tees**, we exclusively use 240 GSM combed cotton. This ensures that after 50 washes, your tee looks and feels exactly like the day you unboxed it.
            </p>
          </section>

          <section className="bg-brand-card p-10 border-y border-brand-border text-center">
            <h3 className="font-display text-3xl mb-4 text-brand-white uppercase">Experience the Weight</h3>
            <p className="mb-8">Upgrade your wardrobe with our 240 GSM Combed Cotton Essentials.</p>
            <Link to="/shop" className="btn-primary px-12">Shop Pro-Grade Tees</Link>
          </section>

          <section>
            <h2 className="text-brand-white font-display text-3xl tracking-wide mb-6">FAQ Section</h2>
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

export default FabricComparison;
