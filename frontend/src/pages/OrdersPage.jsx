import { useQuery } from '@tanstack/react-query'
import { orderAPI, getImageUrl } from '@/utils/api'
import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

const STATUS_COLORS = {
  pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  confirmed: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  processing: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  shipped: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  delivered: 'text-brand-accent border-brand-accent/30 bg-brand-accent/10',
  cancelled: 'text-red-400 border-red-400/30 bg-red-400/10',
  refunded: 'text-brand-muted border-brand-border',
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderAPI.myOrders().then(r => r.data),
  })

  if (isLoading) {
    return (
      <div className="page-container py-12">
        <h1 className="font-display text-5xl tracking-wider mb-10">MY ORDERS</h1>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-brand-card animate-pulse border border-brand-border" />
          ))}
        </div>
      </div>
    )
  }

  if (!orders?.length) {
    return (
      <div className="page-container py-24 text-center">
        <Package size={48} className="text-brand-muted mx-auto mb-4" />
        <p className="font-display text-4xl text-brand-muted mb-4">NO ORDERS YET</p>
        <Link to="/shop" className="btn-primary inline-block">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="page-container py-12">
      <h1 className="font-display text-5xl tracking-wider mb-10">MY ORDERS</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border border-brand-border bg-brand-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-mono text-xs text-brand-muted mb-1">Order Number</p>
                <p className="font-mono text-sm text-brand-white font-medium">#{order.order_number}</p>
              </div>
              <span className={clsx(
                'font-mono text-xs px-3 py-1 border uppercase tracking-wider',
                STATUS_COLORS[order.status] || 'text-brand-muted'
              )}>
                {order.status}
              </span>
            </div>

            {/* Items preview */}
            <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
              {order.items.map(item => (
                <div key={item.id} className="shrink-0">
                  <div className="w-16 h-20 bg-brand-hover overflow-hidden mb-1">
                    <img
                      src={getImageUrl(item.product_image)}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-mono text-[10px] text-brand-muted text-center">{item.size} ×{item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-brand-border">
              <div className="flex gap-6">
                <div>
                  <p className="font-mono text-[10px] text-brand-muted mb-0.5">Total</p>
                  <p className="font-semibold">₹{Number(order.total).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-brand-muted mb-0.5">Date</p>
                  <p className="text-sm">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                {order.tracking_number && (
                  <div>
                    <p className="font-mono text-[10px] text-brand-muted mb-0.5">Tracking</p>
                    <p className="font-mono text-sm text-brand-accent">{order.tracking_number}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
