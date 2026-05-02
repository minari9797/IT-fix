'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, LogOut, Ticket, CheckCircle2, Clock, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/hooks'
import { useSidebar } from '@/lib/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser()
  const { isOpen } = useSidebar()
  const router = useRouter()
  const [ticketStats, setTicketStats] = useState({ total: 0, resolved: 0, pending: 0 })
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    supabase
      .from('tickets')
      .select('status')
      .then(({ data }) => {
        if (data) {
          setTicketStats({
            total: data.length,
            resolved: data.filter((t) => t.status === 'resolved').length,
            pending: data.filter((t) => t.status === 'pending').length,
          })
        }
      })
  }, [user])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const fullName = user?.user_metadata?.full_name || 'User'
  const email = user?.email || ''
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  if (authLoading) return null

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar title="Profile" />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-72" : "md:ml-20"
      )}>
        <div className="px-4 pt-4 md:px-8 md:pt-10 max-w-lg mx-auto w-full space-y-4">

          {/* Avatar card */}
          <Card className="text-center py-10 shadow-xl shadow-blue-900/10">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-900/50 mb-4">
                {initials}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{fullName}</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{email}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-4">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  Verified Member
                </span>
              </div>
              {joinDate && (
                <p className="text-xs text-slate-500 mt-4 font-medium">Member since {joinDate}</p>
              )}
            </div>
          </Card>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: ticketStats.total, icon: Ticket, color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50' },
              { label: 'Pending', value: ticketStats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10' },
              { label: 'Resolved', value: ticketStats.resolved, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10' },
            ].map((s) => (
              <Card key={s.label} className="text-center py-5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2.5 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Account information details */}
          <Card className="divide-y divide-slate-200 dark:divide-slate-700/50">
            <div className="pb-3 px-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Details</p>
            </div>
            <div className="py-5 flex items-center gap-4 px-1">
              <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 flex items-center justify-center shadow-inner">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Full Name</p>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 tracking-tight">{fullName}</p>
              </div>
            </div>
            <div className="py-5 flex items-center gap-4 px-1">
              <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 flex items-center justify-center shadow-inner">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Email Address</p>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 tracking-tight">{email}</p>
              </div>
            </div>
          </Card>

          {/* Action button */}
          <Button
            variant="danger"
            fullWidth
            size="lg"
            loading={signingOut}
            onClick={handleSignOut}
            className="mt-2 shadow-lg shadow-red-900/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>

        </div>
      </main>


    </div>
  )
}
