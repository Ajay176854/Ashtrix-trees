import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { orderAPI, getImageUrl } from '@/utils/api'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().length(6, '6-digit pincode required'),
})

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
]

/** Wrap a promise with a timeout. Throws if it exceeds ms. */
function withTimeout(promise, ms = 30000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out. Please try again.')), ms)
  )
  return Promise.race([promise, timeout])
}

/** Generate a UUID v4 for idempotency. */
function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

/** Get or create a stable idempotency key for this cart session. */
function getIdempotencyKey() {
  const key = sessionStorage.getItem('ashtrix_idem_key') || genUUID()
  sessionStorage.setItem('ashtrix_idem_key', key)
  return key
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [statusMsg, setStatusMsg] = useState('') // "Creating order…" / "Confirming…"
  const submittingRef = useRef(false)            // prevents any concurrent submission

  const { items, coupon: couponCode, discount, clearCart } = useCartStore()
  const { user } = useAuthStore()

  const subtotal = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      state: '',
    },
  })

  // Zone-Based Shipping Logic
  const selectedCity = watch('city')
  const selectedState = watch('state')
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  const calculateShipping = (city, state, subtotal, qty) => {
    const stateL = state?.trim().toLowerCase()
    let baseFee, extraFee, threshold, zoneName

    if (stateL === 'tamil nadu') {
      [baseFee, extraFee, threshold, zoneName] = [45, 20, 599, 'Local/State']
    } else if (['karnataka', 'kerala', 'andhra pradesh', 'telangana', 'puducherry'].includes(stateL)) {
      [baseFee, extraFee, threshold, zoneName] = [70, 25, 899, 'Nearby States']
    } else if (['maharashtra', 'gujarat', 'goa', 'madhya pradesh', 'chhattisgarh', 'odisha'].includes(stateL)) {
      [baseFee, extraFee, threshold, zoneName] = [95, 35, 1199, 'Mid Distance']
    } else {
      [baseFee, extraFee, threshold, zoneName] = [120, 40, 1499, 'Long Distance']
    }

    if (subtotal >= threshold) return { fee: 0, zoneName, threshold }

    const units = Math.ceil(qty / 2)
    const fee = baseFee + (Math.max(0, units - 1) * extraFee)
    return { fee: Math.round(fee), zoneName, threshold }
  }

  const { fee: shipping, zoneName, threshold: shippingThreshold } = calculateShipping(selectedCity, selectedState, subtotal, totalQty)
  const total = subtotal - discount + shipping

  const loadRazorpay = () =>
    new Promise(resolve => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const onSubmit = async (formData) => {
    if (items.length === 0) { toast.error('Your cart is empty'); return }

    // Hard guard: prevent concurrent or duplicate submissions
    if (submittingRef.current) return
    submittingRef.current = true
    setPlacing(true)
    setStatusMsg('Creating order…')

    try {
      const idempotencyKey = getIdempotencyKey()

      // 1. Create order on backend (with idempotency key)
      const orderPayload = {
        items: items.map(i => ({
          product_id: i.product.id,
          size: i.size,
          quantity: i.quantity,
        })),
        address: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        coupon_code: couponCode || undefined,
        idempotency_key: idempotencyKey,
      }

      const { data: orderData } = await withTimeout(orderAPI.create(orderPayload), 30000)

      // 2. Decide: Razorpay online payment OR Cash on Delivery
      if (orderData.key_id) {
        // ── RAZORPAY ONLINE PAYMENT ──────────────────────────
        setStatusMsg('Opening payment…')
        const loaded = await loadRazorpay()
        if (!loaded) { toast.error('Razorpay failed to load'); setPlacing(false); submittingRef.current = false; return }

        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Ashtrix Tees',
          description: `Order #${orderData.order_id}`,
          image: '/logo.png',
          order_id: orderData.razorpay_order_id,
          prefill: { name: formData.name, email: formData.email, contact: formData.phone },
          theme: { color: '#E8FF3A' },
          handler: async (response) => {
            try {
              setStatusMsg('Verifying payment…')
              await withTimeout(orderAPI.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.order_id,
              }), 30000)
              sessionStorage.removeItem('ashtrix_idem_key')
              clearCart()
              navigate(`/order-success/${orderData.order_number}`)
            } catch {
              toast.error('Payment verification failed. Contact support.')
              setPlacing(false)
              submittingRef.current = false
            }
          },
          modal: {
            ondismiss: async () => {
              toast('Payment cancelled')
              setPlacing(false)
              submittingRef.current = false
              try { await orderAPI.cancel(orderData.order_id) } catch {}
            },
          },
        }
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', async () => {
          toast.error('Payment failed. Please try again.')
          setPlacing(false)
          submittingRef.current = false
          try { await orderAPI.cancel(orderData.order_id) } catch {}
        })
        rzp.open()

      } else {
        // ── CASH ON DELIVERY FLOW ────────────────────────────
        setStatusMsg('Confirming order…')
        await withTimeout(orderAPI.confirmCod(orderData.order_id), 30000)
        sessionStorage.removeItem('ashtrix_idem_key')
        clearCart()
        navigate(`/order-success/${orderData.order_number}`)
      }

    } catch (e) {
      const msg = e.message === 'Request timed out. Please try again.'
        ? 'Request timed out. Check your internet and try again.'
        : (e.response?.data?.detail || 'Failed to place order. Please try again.')
      toast.error(msg)
      setPlacing(false)
      submittingRef.current = false
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-container py-24 text-center">
        <p className="font-display text-5xl text-brand-muted mb-4">NOTHING TO CHECKOUT</p>
        <a href="/shop" className="btn-primary inline-block">Shop Now</a>
      </div>
    )
  }

  return (
    <div className="page-container py-12">
      <h1 className="font-display text-5xl tracking-wider mb-10">CHECKOUT</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Delivery details */}
          <div className="lg:col-span-3 space-y-6">
            <div className="border border-brand-border p-6 bg-brand-card">
              <h2 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-6">
                Delivery Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">
                    Full Name *
                  </label>
                  <input {...register('name')} className="input-field" placeholder="John Doe" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">
                    Email *
                  </label>
                  <input {...register('email')} type="email" className="input-field" placeholder="you@email.com" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">
                    Phone *
                  </label>
                  <input {...register('phone')} className="input-field" placeholder="9876543210" />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">
                    Pincode *
                  </label>
                  <input {...register('pincode')} className="input-field" placeholder="600001" maxLength={6} />
                  {errors.pincode && <p className="text-red-400 text-xs mt-1">{errors.pincode.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">
                    Address *
                  </label>
                  <input {...register('address')} className="input-field" placeholder="Flat 4B, Street Name, Area" />
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
                </div>

                <div>
                  <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">
                    City *
                  </label>
                  <input {...register('city')} className="input-field" placeholder="Chennai" />
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="font-mono text-[10px] tracking-widest uppercase text-brand-muted block mb-1">
                    State *
                  </label>
                  <select {...register('state')} className="input-field">
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="border border-brand-border p-6 bg-brand-card sticky top-24">
              <h2 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-6">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map(({ product, size, quantity }) => (
                  <div key={`${product.id}-${size}`} className="flex gap-3">
                    <div className="w-12 h-14 bg-brand-hover overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(product.primary_image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{product.name}</p>
                      <p className="font-mono text-[10px] text-brand-muted">Size: {size} × {quantity}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      ₹{(Number(product.price) * quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-brand-border pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-accent">Discount ({couponCode})</span>
                    <span className="text-brand-accent">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Shipping ({zoneName})</span>
                  <span>{shipping === 0 ? <span className="text-brand-accent">FREE</span> : `₹${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="font-mono text-[10px] text-brand-muted">
                    Free shipping to {zoneName} above ₹{shippingThreshold} 
                    (Add ₹{shippingThreshold - subtotal} more)
                  </p>
                )}
                {totalQty > 2 && shipping > 0 && (
                  <p className="font-mono text-[10px] text-brand-accent/70 mt-1">
                    * Includes extra weight charges for {totalQty} items
                  </p>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-brand-border">
                  <span>Total</span>
                  <span className="text-xl">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placing}
                className="btn-primary w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {statusMsg || 'Processing…'}
                  </span>
                ) : (
                  `Place Order — ₹${total.toLocaleString('en-IN')}`
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="font-mono text-[10px] text-brand-muted">SECURE CHECKOUT</span>
                <span className="font-mono text-[10px] text-brand-accent font-bold">🔒</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
