'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[grid-slate-800/[0.05]] relative">
       {/* Ambient Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-900/50 mb-4 transition-transform hover:scale-110 duration-300">
            <Zap className="w-8 h-8 text-white fill-white/20" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">IT-Fix</h1>
          <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">Enterprise Support Portal</p>
        </div>

        {/* Auth Card */}
        <Card className="p-8 shadow-2xl shadow-blue-950/20">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              id="email"
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
                <label htmlFor="password" className="text-sm font-semibold text-slate-300">Access Key</label>
                <Link href="#" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={cn(
                    "w-full rounded-lg border bg-slate-800/50 pl-11 pr-11 py-3.5 text-slate-100 text-sm placeholder:text-slate-600 transition-all duration-200 outline-none",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    errors.password ? 'border-red-500' : 'border-slate-700'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-medium text-red-500 mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-4 shadow-xl shadow-blue-900/40">
              Authenticate
            </Button>
          </form>

          <div className="relative my-8">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/50"></div></div>
             <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-slate-800 px-3 text-slate-500 font-bold">New to Platform</span></div>
          </div>

          <p className="text-center text-sm font-medium text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Request Access
            </Link>
          </p>
        </Card>

        <footer className="mt-10 flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                IT-Fix Cloud Infrastructure © {new Date().getFullYear()}
            </p>
            <div className="flex gap-4 text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                <Link href="#" className="hover:text-slate-500 transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-slate-500 transition-colors">Terms</Link>
                <Link href="#" className="hover:text-slate-500 transition-colors">Security</Link>
            </div>
        </footer>
      </div>
    </div>
  )
}
