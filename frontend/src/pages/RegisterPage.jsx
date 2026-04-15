import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '@/utils/api'
import { useAuthStore } from '@/store/authStore'
import SEOHead from '@/components/seo/SEOHead'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { data: res } = await authAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      })
      setAuth(res.access_token, res.refresh_token, res.user)
      toast.success(`Welcome to Ashtrix Tees, ${res.user.name}!`)
      navigate('/')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <SEOHead title="Create Account" noIndex={true} />
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl tracking-wider mb-2">JOIN US</h1>
          <p className="text-brand-muted text-sm">Create your Ashtrix Tees account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">Full Name</label>
            <input {...register('name', { required: 'Name required' })} className="input-field" placeholder="Your Name" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">Email</label>
            <input {...register('email', { required: 'Email required' })} type="email" className="input-field" placeholder="you@email.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">Phone (optional)</label>
            <input {...register('phone')} className="input-field" placeholder="9876543210" />
          </div>

          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">Password</label>
            <input
              {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
              type="password"
              className="input-field"
              placeholder="Min 8 characters"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">Confirm Password</label>
            <input
              {...register('confirm', {
                required: 'Please confirm password',
                validate: v => v === password || 'Passwords do not match',
              })}
              type="password"
              className="input-field"
              placeholder="Repeat password"
            />
            {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-muted mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-white hover:text-brand-accent transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
