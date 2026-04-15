// ─── ORDER SUCCESS ────────────────────────────────────────────────────────
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

export function OrderSuccessPage() {
  const { orderNumber } = useParams()
  return (
    <div className="page-container py-24 text-center">
      <div className="max-w-md mx-auto">
        <CheckCircle2 size={64} className="text-brand-accent mx-auto mb-6" />
        <h1 className="font-display text-5xl tracking-wider mb-4">ORDER PLACED!</h1>
        <p className="text-brand-muted mb-2">
          Your order has been confirmed.
        </p>
        <p className="font-mono text-brand-accent text-sm mb-8">#{orderNumber}</p>
        <p className="text-brand-muted text-sm mb-8">
          A confirmation email has been sent. We'll update you when it ships.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/orders" className="btn-outline">View Orders</Link>
          <Link to="/shop" className="btn-primary">Keep Shopping</Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
