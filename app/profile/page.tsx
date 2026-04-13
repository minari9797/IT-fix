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
import MobileNav from '@/components/layout/MobileNav'
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar title="Profile" />

      <main className={cn(
        "pb-24 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-0"
      )}>
        <div className="px-4 pt-4 md:px-8 md:pt-8 max-w-lg">

          {/* Avatar card */}
          <Card className="mb-4 text-center py-8">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-200 mb-4">
                {initials}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{fullName}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-sm text-gray-400">{email}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Member
                </span>
              </div>
              {joinDate && (
                <p className="text-xs text-gray-300 mt-2">Member since {joinDate}</p>
              )}
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Total', value: ticketStats.total, icon: Ticket, color: 'text-gray-600 bg-gray-100' },
              { label: 'Pending', value: ticketStats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
              { label: 'Resolved', value: ticketStats.resolved, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            ].map((s) => (
              <Card key={s.label} className="text-center py-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="text-xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Account info */}
          <Card className="mb-4 divide-y divide-gray-50">
            <div className="py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Full Name</p>
                <p className="text-sm font-medium text-gray-800">{fullName}</p>
              </div>
            </div>
            <div className="py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">{email}</p>
              </div>
            </div>
          </Card>

          {/* Sign out */}
          <Button
            variant="danger"
            fullWidth
            loading={signingOut}
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
