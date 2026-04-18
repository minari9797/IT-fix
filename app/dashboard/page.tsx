'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Plus, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/hooks'
import { useSidebar } from '@/lib/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import Topbar from '@/components/layout/Topbar'
import TicketCard from '@/components/TicketCard'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { TicketCardSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

type TicketRow = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  image_url: string | null
  technician_id: string | null
  technicians?: { name: string } | null
}

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'resolved'

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
]

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    fetchTickets()
  }, [user])

  const fetchTickets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tickets')
      .select('*, technicians(name)')
      .order('created_at', { ascending: false })

    if (error) toast.error('Failed to load tickets')
    else setTickets(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  const { isOpen } = useSidebar()

  if (authLoading) return null

  return (
    <div className="min-h-screen uppercase-first">
      <Sidebar />
      <Topbar title="Dashboard" />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">
          {/* Header — desktop only (mobile uses Topbar) */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Hey, {firstName} 👋
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Here's your support overview</p>
            </div>
            <Button
              onClick={() => router.push('/create-ticket')}
              size="sm"
              className="hidden md:flex"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, icon: Ticket, color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10' },
              { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10' },
              { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 shadow-sm transition-colors duration-300">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none mb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                  ${filter === f.value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-600 hover:text-blue-600 dark:hover:text-slate-200 shadow-sm'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Ticket list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <TicketCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="lg:col-span-2">
                <EmptyState
                  icon={<Ticket className="w-7 h-7" />}
                  title="No tickets yet"
                  description={
                    filter === 'all'
                      ? "You haven't submitted any support tickets yet."
                      : `No ${filter.replace('_', ' ')} tickets found.`
                  }
                  action={
                    filter === 'all' ? (
                      <Button onClick={() => router.push('/create-ticket')}>
                        <Plus className="w-4 h-4" />
                        Create your first ticket
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              filtered.map((ticket, i) => (
                <div
                  key={ticket.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <TicketCard ticket={ticket} />
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => router.push('/create-ticket')}
        className="fixed bottom-20 right-6 md:hidden w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/40 active:scale-95 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <MobileNav />
    </div>
  )
}
