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
          {/* Hero Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                <CheckCircle2 className="w-4 h-4" />
                Infrastructure Health Nominal
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[0.9]">
                     Support <span className="text-blue-600">Command.</span>
                   </h1>
                   <p className="text-lg text-slate-500 dark:text-slate-400 mt-6 font-medium max-w-xl">
                     Welcome back, {firstName}. You have <span className="text-slate-900 dark:text-slate-100 font-bold">{stats.pending + stats.inProgress} active requests</span> currently being handled by our elite engineering team.
                   </p>
                </div>
                <Button
                  onClick={() => router.push('/create-ticket')}
                  size="lg"
                  className="shadow-xl shadow-blue-900/20 bg-blue-600 hover:bg-blue-500 py-6 px-8 rounded-2xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Support Ticket
                </Button>
            </div>

            {/* Performance Strip */}
            <div className="flex flex-wrap items-center gap-8 mt-12 p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.total}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Incidents</span>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div className="flex flex-col">
                    <span className="text-3xl font-black text-blue-600">{stats.inProgress + stats.pending}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Now</span>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div className="flex flex-col">
                    <span className="text-3xl font-black text-emerald-500">{stats.resolved}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Resolved</span>
                </div>
                <div className="flex-1" />
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System SLA</span>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">99.9% Uptime</span>
                    </div>
                </div>
            </div>
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
