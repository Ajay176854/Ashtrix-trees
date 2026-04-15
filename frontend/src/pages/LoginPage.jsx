import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '@/utils/api'
import { useAuthStore } from '@/store/authStore'
import SEOHead from '@/components/seo/SEOHead'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore(s => s.setAuth)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { data: res } = await authAPI.login(data)
      setAuth(res.access_token, res.refresh_token, res.user)
      toast.success(`Welcome back, ${res.user.name}!`)
      
      const from = location.state?.from?.pathname || (res.user.role === 'admin' ? '/admin' : '/')
      navigate(from, { replace: true })
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <SEOHead title="Sign In" noIndex={true} />
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl tracking-wider mb-2">SIGN IN</h1>
          <p className="text-brand-muted text-sm">Welcome back to Ashtrix Tees</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">
              Email
            </label>
            <input
              {...register('email', { required: 'Email required' })}
              type="email"
              className="input-field"
              placeholder="you@email.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted">
                Password
              </label>
              <a href="#" className="font-mono text-[10px] text-brand-accent">Forgot?</a>
            </div>
            <input
              {...register('password', { required: 'Password required' })}
              type="password"
              className="input-field"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-muted mt-8">
          New here?{' '}
          <Link to="/register" className="text-brand-white hover:text-brand-accent transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
