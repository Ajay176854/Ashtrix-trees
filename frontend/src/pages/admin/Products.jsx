import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productAPI, categoryAPI } from '@/utils/api'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminProducts() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', category_id: '', price: '', compare_price: '', description: '', sku: '', is_featured: false, is_active: true })
  const [csvFile, setCsvFile] = useState(null)
  const [showImages, setShowImages] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => productAPI.list({ page, per_page: 20 }).then(r => r.data),
  })
  
  const refreshProduct = async (p) => {
    const { data: updated } = await productAPI.get(p.slug)
    setShowImages(updated)
    qc.invalidateQueries(['admin-products'])
  }

  const uploadMut = useMutation({
    mutationFn: ({id, fd}) => productAPI.uploadImage(id, fd),
    onSuccess: (_, { id }) => {
      toast.success('Image uploaded')
      refreshProduct(showImages)
    }
  })

  const deleteImgMut = useMutation({
    mutationFn: ({pid, iid}) => productAPI.deleteImage(pid, iid),
    onSuccess: () => {
      toast.success('Image deleted')
      refreshProduct(showImages)
    }
  })

  const primaryMut = useMutation({
    mutationFn: ({pid, iid}) => productAPI.setPrimaryImage(pid, iid),
    onSuccess: () => {
      toast.success('Primary image set')
      refreshProduct(showImages)
    }
  })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryAPI.list().then(r => r.data) })

  const deleteMut = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-products']); toast.success('Product deleted') },
  })

  const saveMut = useMutation({
    mutationFn: (d) => {
      const payload = { 
        ...d, 
        price: d.price ? parseFloat(d.price) : 0,
        compare_price: d.compare_price ? parseFloat(d.compare_price) : null,
        category_id: parseInt(d.category_id)
      }
      return editing ? productAPI.update(editing.id, payload) : productAPI.create(payload)
    },
    onSuccess: (res) => {
      qc.invalidateQueries(['admin-products'])
      toast.success(editing ? 'Product updated' : 'Product created')
      if (!editing) setShowImages(res.data)
      setShowForm(false); setEditing(null)
      setForm({ name: '', category_id: '', price: '', compare_price: '', description: '', sku: '', is_featured: false, is_active: true })
    },
    onError: e => toast.error(e.response?.data?.detail || 'Error'),
  })

  const csvMut = useMutation({
    mutationFn: () => {
      const fd = new FormData(); fd.append('file', csvFile)
      return categoryAPI.bulkUpload(fd)
    },
    onSuccess: (d) => {
      toast.success(`${d.data.created} products imported`)
      qc.invalidateQueries(['admin-products'])
    },
    onError: e => toast.error(e.response?.data?.detail || 'Upload failed'),
  })

  const openEdit = (p) => {
    setEditing(p)
    setForm({ 
      name: p.name, 
      category_id: p.category_id, 
      price: p.price, 
      compare_price: p.compare_price || '', 
      description: p.description || '', 
      sku: p.sku || '', 
      is_featured: p.is_featured,
      is_active: p.is_active 
    })
    setShowForm(true)
  }

  const stockMut = useMutation({
    mutationFn: ({ pid, vid, stock }) => productAPI.updateStock(pid, vid, stock),
    onSuccess: () => { qc.invalidateQueries(['admin-products']); toast.success('Stock updated') }
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl tracking-wider">PRODUCTS</h1>
        <div className="flex gap-3">
          {/* CSV Upload */}
          <label className="btn-outline text-xs cursor-pointer flex items-center gap-2 px-4 py-2">
            <Upload size={14} />
            CSV Import
            <input type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files[0])} />
          </label>
          {csvFile && (
            <button onClick={() => csvMut.mutate()} disabled={csvMut.isPending} className="btn-primary text-xs px-4 py-2">
              {csvMut.isPending ? 'Uploading...' : `Upload "${csvFile.name}"`}
            </button>
          )}
          <button onClick={() => { setShowForm(true); setEditing(null) }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-6">
              {editing ? 'Edit Product' : 'Add Product'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input-field" placeholder="Product name" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Category *</label>
                <select value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))} className="input-field">
                  <option value="">Select</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Price *</label>
                  <input value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} className="input-field" type="number" placeholder="499" />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Compare Price</label>
                  <input value={form.compare_price} onChange={e => setForm(f => ({...f, compare_price: e.target.value}))} className="input-field" type="number" placeholder="699" />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">SKU</label>
                <input value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} className="input-field" placeholder="AT-0001" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-brand-muted tracking-widest uppercase block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="input-field resize-none" rows={3} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} className="accent-brand-accent" />
                  <span className="font-mono text-xs text-brand-muted uppercase">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({...f, is_featured: e.target.checked}))} className="accent-brand-accent" />
                  <span className="font-mono text-xs text-brand-muted uppercase">Featured</span>
                </label>
              </div>

              {editing && (
                <div className="pt-4 border-t border-brand-border">
                  <p className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-4">Inventory / Stock</p>
                  <div className="grid grid-cols-3 gap-3">
                    {editing.variants?.map(v => (
                      <div key={v.id}>
                        <label className="font-mono text-[9px] text-brand-muted block mb-1">{v.size}</label>
                        <input 
                          type="number" 
                          defaultValue={v.stock}
                          onBlur={e => {
                            if (e.target.value !== String(v.stock)) {
                              stockMut.mutate({ pid: editing.id, vid: v.id, stock: parseInt(e.target.value) })
                            }
                          }}
                          className="input-field py-1 px-2 text-xs" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} className="btn-primary flex-1">
                  {saveMut.isPending ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-outline flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Image Management Modal */}
      {showImages && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-mono text-xs tracking-widest uppercase text-brand-muted">
                Manage Images - {showImages.name}
              </h2>
              <button onClick={() => setShowImages(null)} className="text-brand-muted hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {showImages.images?.map(img => (
                <div key={img.id} className="relative aspect-[3/4] border border-brand-border group">
                  <img src={img.url} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {!img.is_primary && (
                      <button 
                        onClick={() => primaryMut.mutate({ pid: showImages.id, iid: img.id })}
                        className="text-[10px] font-mono bg-brand-accent text-brand-black px-2 py-1"
                      >Set Primary</button>
                    )}
                    <button 
                      onClick={() => { if(confirm('Delete?')) deleteImgMut.mutate({ pid: showImages.id, iid: img.id }) }}
                      className="text-[10px] font-mono bg-red-400 text-white px-2 py-1"
                    >Delete</button>
                  </div>
                  {img.is_primary && (
                    <span className="absolute top-2 left-2 bg-brand-accent text-brand-black text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-tighter">Primary</span>
                  )}
                </div>
              ))}
              <label className="aspect-[3/4] border-2 border-dashed border-brand-border flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent transition-colors group">
                <Upload size={24} className="text-brand-muted group-hover:text-brand-accent mb-2" />
                <span className="font-mono text-[9px] text-brand-muted uppercase">Upload Image</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0]
                    if (file) {
                      const fd = new FormData()
                      fd.append('file', file)
                      fd.append('is_primary', showImages.images?.length === 0)
                      uploadMut.mutate({ id: showImages.id, fd })
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-brand-border bg-brand-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['#', 'Product', 'Category', 'Price', 'SKU', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-mono text-[10px] text-brand-muted tracking-widest uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-brand-border">
                  {Array(7).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-brand-hover animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : data?.items?.map(p => (
              <tr key={p.id} className="border-b border-brand-border hover:bg-brand-hover transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand-muted">{p.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-brand-hover overflow-hidden shrink-0">
                      <img src={p.primary_image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-xs truncate max-w-[160px]">{p.name}</p>
                      {p.is_featured && <span className="font-mono text-[9px] text-brand-accent">FEATURED</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-muted text-xs">{p.category_id}</td>
                <td className="px-4 py-3 font-semibold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 font-mono text-xs text-brand-muted">{p.sku || '-'}</td>
                <td className="px-4 py-3">
                  <span className={clsx('font-mono text-[9px] px-2 py-0.5', p.is_active ? 'bg-brand-accent/10 text-brand-accent' : 'bg-red-400/10 text-red-400')}>
                    {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setShowImages(p)} className="p-1.5 text-brand-muted hover:text-brand-accent transition-colors" title="Manage Images">
                      <Upload size={13} />
                    </button>
                    <button onClick={() => openEdit(p)} className="p-1.5 text-brand-muted hover:text-white transition-colors" title="Edit Product">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(p.id) }} className="p-1.5 text-brand-muted hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex gap-2 mt-4 justify-end">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={clsx('w-8 h-8 font-mono text-xs', page === p ? 'bg-brand-accent text-brand-black' : 'border border-brand-border text-brand-muted hover:border-white')}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
