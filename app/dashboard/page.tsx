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
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled' | 'archived'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  image_url: string | null
  technician_id: string | null
  technicians?: { name: string } | null
}

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'resolved' | 'cancelled' | 'archived'

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Archived', value: 'archived' },
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

  const activeTickets = tickets.filter(t => t.status !== 'cancelled' && t.status !== 'archived')
  const filtered = filter === 'all' ? activeTickets : tickets.filter((t) => t.status === filter)

  const stats = {
    total: activeTickets.length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  const { isOpen } = useSidebar()

  if (authLoading) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#131315' }}>
      <Sidebar />
      <Topbar title="Dashboard" />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-72" : "md:ml-20"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8e90a2' }}>User Portal / Dashboard</p>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#e5e1e4' }}>My Tickets</h1>
              <p className="text-sm mt-1" style={{ color: '#c4c5d9' }}>Track and manage your support requests</p>
            </div>
            <Button onClick={() => router.push('/create-ticket')} size="sm" className="hidden md:flex">
              New Ticket
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Active', value: stats.total,      color: '#c4c5d9' },
              { label: 'Pending',      value: stats.pending,    color: '#f59e0b' },
              { label: 'In Progress',  value: stats.inProgress, color: '#b8c3ff' },
              { label: 'Resolved',     value: stats.resolved,   color: '#4ade80' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-5 border border-slate-700/50 shadow-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-2xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#434656' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none mb-6 -mx-4 px-4 md:mx-0 md:px-0">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="flex-shrink-0 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200"
                style={filter === f.value
                  ? { backgroundColor: '#2e5bff', color: '#efefff', border: '1px solid transparent', boxShadow: '0 0 16px rgba(46,91,255,0.25)' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#8e90a2', border: '1px solid rgba(255,255,255,0.08)' }
                }
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


    </div>
  )
}
