'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function TechnicianLoginPage() {
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      toast.error(error.message)
      return
    }

    // Verify the signed-in user is actually a technician
    const { data: techData, error: techError } = await supabase
      .from('technicians')
      .select('id')
      .eq('email', data.user.email)
      .single()

    setLoading(false)

    if (techError || !techData) {
      await supabase.auth.signOut()
      toast.error('Access denied. This portal is for technicians only.')
      return
    }

    toast.success('Welcome back, Technician!')
    router.push('/technician-portal/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Glow — amber tint to differentiate from user portal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-2xl shadow-amber-900/50 mb-4 transition-transform hover:scale-110 duration-300">
            <ShieldCheck className="w-8 h-8 text-white fill-white/20" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            IT-Fix
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">
            Technician Portal
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-8 shadow-2xl shadow-amber-950/20">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              id="tech-email"
              type="email"
              label="Work e-mail"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="tech-password"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Access Key
                </label>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="tech-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={cn(
                    'w-full rounded-lg border bg-white dark:bg-slate-800/50 pl-11 pr-11 py-3.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all duration-200 outline-none',
                    'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
                    errors.password
                      ? 'border-red-500'
                      : 'border-slate-300 dark:border-slate-700'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900',
                'bg-amber-500 hover:bg-amber-400 text-white shadow-xl shadow-amber-900/40 focus:ring-amber-500',
                'px-6 py-3.5 text-base mt-4'
              )}
            >
              {loading && (
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              Authenticate
            </button>
          </form>
        </Card>

        <footer className="mt-10 flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
            IT-Fix Cloud Infrastructure © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 text-[10px] font-bold text-slate-700 uppercase tracking-widest">
            <span className="text-amber-600 dark:text-amber-500">Restricted Access</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
