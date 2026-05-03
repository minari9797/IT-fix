'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'At least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      router.push('/dashboard')
    }
  }

  const inputBase = {
    backgroundColor: '#1c1b1d',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#e5e1e4',
    borderRadius: '0.75rem',
  }

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ backgroundColor: '#131315', color: '#e5e1e4', fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Atmospheric glows */}
      <div className="pointer-events-none fixed -top-[20%] -left-[10%] w-[700px] h-[700px] rounded-full blur-[150px]"
           style={{ background: 'rgba(46,91,255,0.12)' }} />
      <div className="pointer-events-none fixed top-[40%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[120px]"
           style={{ background: 'rgba(87,27,193,0.07)' }} />

      {/* LEFT — Branding */}
      <div className="hidden md:flex w-1/2 flex-col justify-between p-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2e5bff' }}>
            <Zap className="w-6 h-6" style={{ color: '#efefff' }} />
          </div>
          <span className="text-2xl font-extrabold" style={{ color: '#e5e1e4' }}>IT-Fix</span>
        </div>

        {/* Hero copy */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="font-extrabold leading-tight mb-6" style={{ fontSize: '56px', letterSpacing: '-0.03em', color: '#e5e1e4' }}>
            IT Support,{'\n'}Simplified.
          </h1>
          <p style={{ fontSize: '18px', color: '#c4c5d9', lineHeight: '1.6', maxWidth: '24rem' }}>
            A streamlined ticketing experience designed to keep your workflow uninterrupted and your systems secure.
          </p>
        </div>

        {/* Footer stats */}
        <div className="flex items-center gap-6 text-[12px] font-bold uppercase tracking-widest" style={{ color: '#8e90a2' }}>
          <span>Avg. response: &lt; 15 mins</span>
          <span style={{ width: 1, height: 16, backgroundColor: '#434656', display: 'inline-block' }} />
          <span>Uptime: 99.9%</span>
        </div>
      </div>

      {/* RIGHT — Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-14 relative z-20">
        <div
          className="w-full max-w-md relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
          }}
        >
          {/* Inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 rounded-full -z-10"
               style={{ background: 'rgba(46,91,255,0.08)', filter: 'blur(40px)' }} />

          <div className="mb-8">
            <h2 className="font-bold mb-2" style={{ fontSize: '28px', letterSpacing: '-0.01em', color: '#e5e1e4' }}>Se connecter</h2>
            <p style={{ fontSize: '15px', color: '#c4c5d9' }}>Entrez vos identifiants pour accéder au portail.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[12px] font-bold uppercase tracking-wider" style={{ color: '#c4c5d9' }}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="nom@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3 text-sm outline-none transition-all duration-200 shadow-inner"
                style={{ ...inputBase, ...(errors.email ? { borderColor: '#ffb4ab' } : {}) }}
                onFocus={(e) => { if (!errors.email) { e.target.style.borderColor = '#b8c3ff'; e.target.style.boxShadow = '0 0 0 1px rgba(184,195,255,0.3)' } }}
                onBlur={(e) => { if (!errors.email) { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '' } }}
              />
              {errors.email && <p className="text-xs" style={{ color: '#ffb4ab' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-[12px] font-bold uppercase tracking-wider" style={{ color: '#c4c5d9' }}>Mot de passe</label>
                <Link href="#" className="text-[11px] font-bold uppercase tracking-widest transition-colors" style={{ color: '#b8c3ff' }}>Oublié ?</Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 pr-12 py-3 text-sm outline-none transition-all duration-200 shadow-inner"
                  style={{ ...inputBase, ...(errors.password ? { borderColor: '#ffb4ab' } : {}) }}
                  onFocus={(e) => { if (!errors.password) { e.target.style.borderColor = '#b8c3ff'; e.target.style.boxShadow = '0 0 0 1px rgba(184,195,255,0.3)' } }}
                  onBlur={(e) => { if (!errors.password) { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '' } }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#8e90a2' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs" style={{ color: '#ffb4ab' }}>{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 text-[12px] font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 active:scale-[0.98] mt-3"
              style={{
                backgroundColor: '#2e5bff',
                color: '#efefff',
                borderRadius: '0.75rem',
                boxShadow: '0 0 20px rgba(46,91,255,0.2)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dde1ff'; e.currentTarget.style.color = '#001356'; e.currentTarget.style.boxShadow = '0 0 30px rgba(46,91,255,0.4)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2e5bff'; e.currentTarget.style.color = '#efefff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(46,91,255,0.2)' }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
              {!loading && <span>→</span>}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '14px', color: '#c4c5d9' }}>
              Pas de compte ?{' '}
              <Link href="/signup" className="font-bold transition-colors" style={{ color: '#b8c3ff' }}>
                Contacter le support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
