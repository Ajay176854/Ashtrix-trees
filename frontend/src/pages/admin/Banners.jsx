import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bannerAPI } from '@/utils/api'
import { Trash2, Upload } from 'lucide-react'
import api from '@/utils/api'
import toast from 'react-hot-toast'

export default function AdminBanners() {
  const qc = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', subtitle: '', link: '', sort_order: 0 })
  const [file, setFile] = useState(null)

  const { data: banners } = useQuery({ queryKey: ['banners'], queryFn: () => bannerAPI.list().then(r => r.data) })

  const deleteMut = useMutation({
    mutationFn: bannerAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['banners']); toast.success('Banner deleted') },
  })

  const handleUpload = async () => {
    if (!file) { toast.error('Select an image'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      await api.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      qc.invalidateQueries(['banners'])
      toast.success('Banner created')
      setFile(null)
      setForm({ title: '', subtitle: '', link: '', sort_order: 0 })
    } catch (e) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-4xl tracking-wider mb-8">BANNERS</h1>

      {/* Upload form */}
      <div className="border border-brand-border bg-brand-card p-6 mb-8">
        <h2 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-4">Add New Banner</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-mono text-[10px] text-brand-muted block mb-1">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input-field" placeholder="NEW DROP ✦ SS25" />
          </div>
          <div>
            <label className="font-mono text-[10px] text-brand-muted block mb-1">Subtitle</label>
            <input value={form.subtitle} onChange={e => setForm(f => ({...f, subtitle: e.target.value}))} className="input-field" placeholder="Shop the freshest fits" />
          </div>
          <div>
            <label className="font-mono text-[10px] text-brand-muted block mb-1">Link</label>
            <input value={form.link} onChange={e => setForm(f => ({...f, link: e.target.value}))} className="input-field" placeholder="/shop" />
          </div>
          <div>
            <label className="font-mono text-[10px] text-brand-muted block mb-1">Sort Order</label>
            <input value={form.sort_order} type="number" onChange={e => setForm(f => ({...f, sort_order: e.target.value}))} className="input-field" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="btn-outline text-xs cursor-pointer flex items-center gap-2 px-4 py-2">
            <Upload size={14} />
            {file ? file.name : 'Choose Image'}
            <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
          </label>
          <button onClick={handleUpload} disabled={uploading || !file} className="btn-primary text-xs">
            {uploading ? 'Uploading...' : 'Upload Banner'}
          </button>
        </div>
      </div>

      {/* Banner list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners?.map(b => (
          <div key={b.id} className="border border-brand-border bg-brand-card overflow-hidden">
            <div className="relative aspect-[16/5]">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                {b.title && <p className="font-display text-xl text-white">{b.title}</p>}
                {b.subtitle && <p className="text-white/60 text-xs">{b.subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between p-3">
              <div>
                <p className="font-mono text-[10px] text-brand-muted">{b.link || 'No link'}</p>
                <p className="font-mono text-[10px] text-brand-muted">Sort: {b.sort_order}</p>
              </div>
              <button onClick={() => { if (confirm('Delete banner?')) deleteMut.mutate(b.id) }} className="text-brand-muted hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
