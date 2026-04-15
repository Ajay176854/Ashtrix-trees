import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <SEOHead title="404 – Page Not Found" noIndex={true} />
      <p className="font-display text-[12rem] leading-none text-brand-border select-none">404</p>
      <h1 className="font-display text-5xl tracking-wider -mt-8 mb-4">PAGE NOT FOUND</h1>
      <p className="text-brand-muted mb-8">Looks like this page dropped off the rack.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  )
}
