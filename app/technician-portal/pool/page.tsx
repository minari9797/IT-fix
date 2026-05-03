'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useTechnician } from '@/lib/hooks'
import { useSidebar } from '@/lib/context/SidebarContext'
import TechnicianTopbar from '@/components/layout/TechnicianTopbar'
import TechnicianTicketCard from '@/components/TechnicianTicketCard'
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
  profiles: { full_name: string } | null
}

export default function OpenPoolPage() {
  const { technician, loading: authLoading } = useTechnician()
  const router = useRouter()
  const { isOpen } = useSidebar()
  
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  useEffect(() => {
    if (!authLoading && !technician) router.push('/technician-portal/login')
  }, [technician, authLoading, router])

  useEffect(() => {
    if (!technician) return
    fetchPool()
  }, [technician])

  const fetchPool = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data: ticketData, error } = await supabase
        .from('tickets')
        .select('*')
        .is('technician_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to access global ticket pool')
        if (!silent) setLoading(false)
        return
      }

      const ticketsWithProfiles = [...(ticketData || [])]
      
      // Fetch profile info manually
      const userIds = Array.from(new Set(ticketsWithProfiles.map(t => t.user_id)))
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)
        
        if (profiles) {
          ticketsWithProfiles.forEach(t => {
            t.profiles = profiles.find(p => p.id === t.user_id) || null
          })
        }
      }

      setTickets(ticketsWithProfiles as any)
    } catch (err) {
      toast.error('Global sync interrupted')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const claimTicket = async (id: string) => {
    // Optimistically remove from pool immediately for instant UX feedback
    setTickets(prev => prev.filter(t => t.id !== id))
    const { data, error } = await supabase
      .from('tickets')
      .update({ 
        technician_id: technician.id, 
        status: 'in_progress' 
      })
      .eq('id', id)
      .select()

    if (error) {
      toast.error('Could not claim ticket')
      fetchPool() // Full reload to revert
    } else if (!data || data.length === 0) {
      toast.error('Claim blocked by permissions — contact admin')
      fetchPool() // Revert optimistic removal
    } else {
      toast.success('Ticket claimed — check your active tasks!')
      // Don't refetch — the ticket is correctly removed from our list
    }
  }

  const filtered = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                         t.description.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  if (authLoading || !technician) return null

  return (
    <div className="min-h-screen uppercase-first" style={{ backgroundColor: '#131315' }}>
      <TechnicianTopbar title="Open Pool" />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8e90a2' }}>System / Operational / Pool</p>
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#e5e1e4' }}>Open Pool</h1>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d0bcff' }}>
                {tickets.length} Available
            </span>
          </div>

          {/* Filtering */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
             <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Search global pool..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 text-sm outline-none transition-all duration-200 rounded-xl shadow-inner"
                    style={{ backgroundColor: '#1c1b1d', border: '1px solid rgba(255,255,255,0.06)', color: '#e5e1e4' }}
                    onFocus={(e) => { e.target.style.borderColor = '#d0bcff'; e.target.style.boxShadow = '0 0 0 1px rgba(208,188,255,0.3)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '' }}
                />
             </div>
             <div className="flex gap-1 rounded-xl p-1 overflow-x-auto scrollbar-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {['all', 'low', 'medium', 'high'].map(p => (
                    <button
                        key={p}
                        onClick={() => setPriorityFilter(p as any)}
                        className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all"
                        style={priorityFilter === p
                          ? { backgroundColor: '#571bc1', color: '#c4abff', boxShadow: '0 0 12px rgba(87,27,193,0.3)' }
                          : { color: '#8e90a2' }
                        }
                    >
                        {p}
                    </button>
                ))}
             </div>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <TicketCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
                <div className="lg:col-span-2">
                    <EmptyState
                    title="Pool Clear"
                    description={
                        search 
                            ? `No results for "${search}"`
                            : "No pending unassigned tickets."
                    }
                    action={
                        search ? (
                            <button onClick={() => {setSearch(''); setPriorityFilter('all')}} className="text-purple-400 hover:text-purple-300 text-xs font-semibold uppercase tracking-wider mt-4">Reset Filters</button>
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
                  <TechnicianTicketCard 
                    ticket={ticket} 
                    onAction={claimTicket}
                    actionLabel="Claim"
                    variant="amber"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
