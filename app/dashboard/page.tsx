'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Plus, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/hooks'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import Topbar from '@/components/layout/Topbar'
import TicketCard from '@/components/TicketCard'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { TicketCardSkeleton } from '@/components/ui/Skeleton'

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

  if (authLoading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar title="Dashboard" />

      <main className="md:ml-60 pb-24 md:pb-8">
        <div className="px-4 pt-4 md:px-8 md:pt-8 max-w-3xl md:max-w-none">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Hey, {firstName} 👋
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Here's your support overview</p>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: stats.total, icon: Ticket, color: 'text-gray-600 bg-gray-100' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
              { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
              { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none mb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  ${filter === f.value
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Ticket list */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <TicketCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
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
        className="fixed bottom-20 right-4 md:hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-300 active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <MobileNav />
    </div>
  )
}
