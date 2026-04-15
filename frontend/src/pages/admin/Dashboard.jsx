import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '@/utils/api'
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="border border-brand-border bg-brand-card p-6">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2 ${accent ? 'bg-brand-accent/10' : 'bg-brand-hover'}`}>
        <Icon size={18} className={accent ? 'text-brand-accent' : 'text-brand-muted'} />
      </div>
    </div>
    <p className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">{label}</p>
    <p className="font-display text-4xl tracking-wider">{value}</p>
    {sub && <p className="font-mono text-xs text-brand-muted mt-1">{sub}</p>}
  </div>
)

const STATUS_BADGE = {
  pending: 'bg-yellow-400/10 text-yellow-400',
  confirmed: 'bg-blue-400/10 text-blue-400',
  processing: 'bg-orange-400/10 text-orange-400',
  shipped: 'bg-purple-400/10 text-purple-400',
  delivered: 'bg-brand-accent/10 text-brand-accent',
  cancelled: 'bg-red-400/10 text-red-400',
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminAPI.analytics().then(r => r.data),
    refetchInterval: 30000,
  })

  if (isLoading) return (
    <div className="p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-36 bg-brand-card animate-pulse border border-brand-border" />)}
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-wider">DASHBOARD</h1>
        <p className="font-mono text-xs text-brand-muted mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`₹${Number(data?.total_revenue || 0).toLocaleString('en-IN')}`}
          sub={`₹${Number(data?.revenue_today || 0).toLocaleString('en-IN')} today`}
          accent
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={data?.total_orders || 0}
          sub={`${data?.orders_today || 0} today`}
        />
        <StatCard icon={Users} label="Total Users" value={data?.total_users || 0} />
        <StatCard icon={Package} label="Active Products" value={data?.total_products || 0} />
      </div>

      {/* Recent orders */}
      <div className="border border-brand-border bg-brand-card">
        <div className="p-4 border-b border-brand-border">
          <h2 className="font-mono text-xs tracking-widest uppercase text-brand-muted">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border">
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-mono text-[10px] text-brand-muted tracking-widest uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.recent_orders?.map(order => (
                <tr key={order.id} className="border-b border-brand-border hover:bg-brand-hover transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-brand-accent">#{order.order_number}</td>
                  <td className="px-4 py-3">{order.ship_name}</td>
                  <td className="px-4 py-3 text-brand-muted">{order.items?.length} item(s)</td>
                  <td className="px-4 py-3 font-semibold">₹{Number(order.total).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[10px] px-2 py-1 uppercase tracking-wider ${STATUS_BADGE[order.status] || 'text-brand-muted'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-muted text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
