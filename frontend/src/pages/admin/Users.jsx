// ─── ADMIN USERS ─────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '@/utils/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export function AdminUsers() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.users().then(r => r.data),
  })
  const toggleMut = useMutation({
    mutationFn: (id) => adminAPI.toggleUser(id),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User updated') },
  })

  return (
    <div className="p-8">
      <h1 className="font-display text-4xl tracking-wider mb-8">USERS</h1>
      <div className="border border-brand-border bg-brand-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['#', 'Name', 'Email', 'Phone', 'Role', 'Joined', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-mono text-[10px] text-brand-muted tracking-widest uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array(6).fill(0).map((_, i) => (
              <tr key={i} className="border-b border-brand-border">
                {Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-brand-hover animate-pulse rounded" /></td>)}
              </tr>
            )) : data?.items?.map(user => (
              <tr key={user.id} className="border-b border-brand-border hover:bg-brand-hover">
                <td className="px-4 py-3 font-mono text-xs text-brand-muted">{user.id}</td>
                <td className="px-4 py-3 font-medium text-xs">{user.name}</td>
                <td className="px-4 py-3 text-brand-muted text-xs">{user.email}</td>
                <td className="px-4 py-3 text-brand-muted text-xs">{user.phone || '-'}</td>
                <td className="px-4 py-3">
                  <span className={clsx('font-mono text-[9px] px-2 py-0.5 uppercase', user.role === 'admin' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-muted')}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-muted text-xs">{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleMut.mutate(user.id)}
                    className={clsx('font-mono text-[9px] px-2 py-0.5 border transition-colors', user.is_active ? 'border-brand-accent/30 text-brand-accent hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/30' : 'border-red-400/30 text-red-400 hover:bg-brand-accent/10 hover:text-brand-accent hover:border-brand-accent/30')}
                  >
                    {user.is_active ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUsers
