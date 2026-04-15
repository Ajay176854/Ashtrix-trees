import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponAPI } from '@/utils/api'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { code: '', type: 'percentage', value: '', min_order: '0', max_discount: '', usage_limit: '', expires_at: '' }

export default function AdminCoupons() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const { data: coupons } = useQuery({ queryKey: ['admin-coupons'], queryFn: () => couponAPI.list().then(r => r.data) })
  const createMut = useMutation({
    mutationFn: couponAPI.create,
    onSuccess: () => { qc.invalidateQueries(['admin-coupons']); toast.success('Coupon created'); setShowForm(false); setForm(EMPTY) },
  })
  const deleteMut = useMutation({
    mutationFn: couponAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['admin-coupons']); toast.success('Deleted') },
  })

  const F = (k) => ({ value: form[k], onChange: e => setForm(f => ({...f, [k]: e.target.value})) })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl tracking-wider">COUPONS</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border w-full max-w-md p-6">
            <h2 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-6">New Coupon</h2>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Code *</label>
                <input {...F('code')} className="input-field uppercase" placeholder="SAVE20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Type</label>
                  <select {...F('type')} className="input-field">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Value *</label>
                  <input {...F('value')} className="input-field" type="number" placeholder={form.type === 'percentage' ? '10' : '50'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Min Order (₹)</label>
                  <input {...F('min_order')} className="input-field" type="number" placeholder="0" />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Max Discount (₹)</label>
                  <input {...F('max_discount')} className="input-field" type="number" placeholder="Optional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Usage Limit</label>
                  <input {...F('usage_limit')} className="input-field" type="number" placeholder="Unlimited" />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Expires At</label>
                  <input {...F('expires_at')} className="input-field" type="datetime-local" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => createMut.mutate(form)} disabled={createMut.isPending} className="btn-primary flex-1">
                  {createMut.isPending ? 'Saving...' : 'Create'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons?.map(c => (
          <div key={c.id} className="border border-brand-border bg-brand-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono text-lg font-bold text-brand-accent">{c.code}</p>
                <p className="font-mono text-xs text-brand-muted">
                  {c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}
                  {c.max_discount ? ` (max ₹${c.max_discount})` : ''}
                </p>
              </div>
              <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(c.id) }} className="text-brand-muted hover:text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
            <div className="space-y-1">
              {Number(c.min_order) > 0 && <p className="font-mono text-[10px] text-brand-muted">Min order: ₹{c.min_order}</p>}
              <p className="font-mono text-[10px] text-brand-muted">
                Used: {c.usage_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}
              </p>
              {c.expires_at && <p className="font-mono text-[10px] text-brand-muted">Expires: {new Date(c.expires_at).toLocaleDateString('en-IN')}</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <span className={`font-mono text-[9px] px-2 py-0.5 ${c.is_active ? 'bg-brand-accent/10 text-brand-accent' : 'bg-red-400/10 text-red-400'}`}>
                {c.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
