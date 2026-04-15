import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderAPI, getImageUrl } from '@/utils/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded']
const STATUS_COLORS = {
  pending: 'text-yellow-400', confirmed: 'text-blue-400', processing: 'text-orange-400',
  shipped: 'text-purple-400', delivered: 'text-brand-accent', cancelled: 'text-red-400', refunded: 'text-brand-muted',
}

export default function AdminOrders() {
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState(null)
  const [trackingInputs, setTrackingInputs] = useState({})

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', filterStatus, page],
    queryFn: () => orderAPI.adminList({ status: filterStatus || undefined, page, per_page: 20 }).then(r => r.data),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status, tracking }) => orderAPI.updateStatus(id, status, tracking),
    onSuccess: () => { qc.invalidateQueries(['admin-orders']); toast.success('Status updated') },
  })

  return (
    <div className="p-8">
      <h1 className="font-display text-4xl tracking-wider mb-8">ORDERS</h1>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilterStatus('')} className={clsx('font-mono text-xs px-3 py-1.5 border transition-colors', !filterStatus ? 'border-brand-accent text-brand-accent' : 'border-brand-border text-brand-muted hover:border-white')}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={clsx('font-mono text-xs px-3 py-1.5 border transition-colors capitalize', filterStatus === s ? 'border-brand-accent text-brand-accent' : 'border-brand-border text-brand-muted hover:border-white')}>
            {s}
          </button>
        ))}
      </div>

      <div className="border border-brand-border bg-brand-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Order #', 'Customer', 'Total', 'Status', 'Date', 'Update', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-mono text-[10px] text-brand-muted tracking-widest uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-brand-border">
                  {Array(7).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-brand-hover animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : orders?.map(order => (
              <>
                <tr key={order.id} className="border-b border-brand-border hover:bg-brand-hover transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-brand-accent">#{order.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">{order.ship_name}</p>
                    <p className="font-mono text-[10px] text-brand-muted">{order.ship_city}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">₹{Number(order.total).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('font-mono text-[10px] uppercase', STATUS_COLORS[order.status])}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-brand-muted text-xs">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={order.status}
                      onChange={e => statusMut.mutate({ id: order.id, status: e.target.value, tracking: trackingInputs[order.id] })}
                      className="text-xs bg-brand-hover border border-brand-border px-2 py-1"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="font-mono text-[10px] text-brand-muted hover:text-white">
                      {expanded === order.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
                {expanded === order.id && (
                  <tr key={`${order.id}-exp`} className="border-b border-brand-border bg-brand-hover">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex-1">
                          <p className="font-mono text-[10px] text-brand-muted uppercase mb-2">Items</p>
                          {order.items.map(item => (
                            <div key={item.id} className="flex gap-4 mb-3 items-center">
                              <div className="w-12 h-14 bg-brand-card overflow-hidden flex-shrink-0 border border-brand-border">
                                <img src={getImageUrl(item.product_image)} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate">{item.product_name}</p>
                                <p className="font-mono text-[10px] text-brand-muted">Size: {item.size} × {item.quantity} = ₹{Number(item.total_price).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-brand-muted uppercase mb-2">Shipping Address</p>
                          <div className="text-xs text-brand-muted space-y-1">
                            <p>{order.ship_address}</p>
                            <p>{order.ship_city}, {order.ship_state} - {order.ship_pincode}</p>
                            <p>{order.ship_country}</p>
                            {order.ship_phone && <p className="text-brand-accent mt-1">📞 {order.ship_phone}</p>}
                          </div>
                          <div className="mt-3">
                            <p className="font-mono text-[10px] text-brand-muted uppercase mb-1">Tracking Number</p>
                            <div className="flex gap-2">
                              <input
                                value={trackingInputs[order.id] || order.tracking_number || ''}
                                onChange={e => setTrackingInputs(t => ({...t, [order.id]: e.target.value}))}
                                placeholder="Enter tracking #"
                                className="input-field text-xs flex-1"
                              />
                              <button
                                onClick={() => statusMut.mutate({ id: order.id, status: order.status, tracking: trackingInputs[order.id] })}
                                className="btn-outline text-xs px-3 py-1"
                              >Save</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
