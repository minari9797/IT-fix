'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Zap, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!fullName.trim()) e.fullName = 'Full name is required'
    if (!email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'At least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Check your email to confirm.')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Ambient Light Effects */}
       <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
       <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-900/50 mb-4 transition-transform hover:rotate-6 duration-300">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Create Account</h1>
          <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest leading-none">Access Node Provisioning</p>
        </div>

        {/* Auth Card */}
        <Card className="p-8 shadow-2xl shadow-blue-950/20">
          <form onSubmit={handleSignup} className="space-y-5">
            <Input
              id="fullName"
              type="text"
              label="Legal Full Name"
              placeholder="e.g. Samuel J. Reed"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              icon={<User className="w-4 h-4" />}
              autoComplete="name"
            />
            
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
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Access Key</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 alphanumeric"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className={cn(
                    "w-full rounded-lg border bg-white dark:bg-slate-800/50 pl-11 pr-11 py-3.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all duration-200 outline-none",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    errors.password ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-medium text-red-500 mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-4 shadow-xl shadow-blue-900/40">
              Initialize Account
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mt-8">
            Already registered?{' '}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              Node Authentication
            </Link>
          </p>
        </Card>

        <footer className="mt-10 flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] text-center">
                Automated Identity Verification Enabled
            </p>
        </footer>
      </div>
    </div>
  )
}
