'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Coffee } from 'lucide-react'
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

type Tab = 'active' | 'resolved'

export default function MyTicketsPage() {
  const { technician, loading: authLoading } = useTechnician()
  const router = useRouter()
  const { isOpen } = useSidebar()
  
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('active')
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Auth redirect removed — open access
  }, [technician, authLoading, router])

  useEffect(() => {
    // Fetch tickets even if not authenticated
    fetchTickets()
  }, [technician, activeTab])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const query = supabase
        .from('tickets')
        .select('*')
        .eq('technician_id', technician?.id || 'dummy')

      if (activeTab === 'active') {
        query.neq('status', 'resolved')
      } else {
        query.eq('status', 'resolved')
      }

      const { data: ticketData, error } = await query.order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load system workload')
        setLoading(false)
        return
      }

      const ticketsWithProfiles = [...(ticketData || [])]
      
      // Fetch profile info for each ticket manually to avoid join failures
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
      toast.error('Network error during data sync')
    } finally {
      setLoading(false)
    }
  }

  const resolveTicket = async (id: string) => {
    // Optimistically remove from active list for instant feedback
    setTickets(prev => prev.filter(t => t.id !== id))
    const { error } = await supabase
      .from('tickets')
      .update({ status: 'resolved' })
      .eq('id', id)

    if (error) {
      toast.error('Failed to resolve ticket')
      fetchTickets() // Revert on error
    } else {
      toast.success('Ticket marked as resolved')
      fetchTickets()
    }
  }

  const filtered = tickets.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  )

  // Auth loading gate removed — open access

  return (
    <div className="min-h-screen uppercase-first" style={{ backgroundColor: '#131315' }}>
      <TechnicianTopbar title="My Tickets" />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">
          
          {/* Header */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8e90a2' }}>System / Operational / Queue</p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#e5e1e4' }}>My Tickets</h1>
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
             <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Search assigned tickets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 text-sm outline-none transition-all duration-200 rounded-xl shadow-inner"
                    style={{ backgroundColor: '#1c1b1d', border: '1px solid rgba(255,255,255,0.06)', color: '#e5e1e4' }}
                    onFocus={(e) => { e.target.style.borderColor = '#d0bcff'; e.target.style.boxShadow = '0 0 0 1px rgba(208,188,255,0.3)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '' }}
                />
             </div>
             <div className="flex rounded-xl p-1 self-start" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {[
                    { id: 'active', label: 'Active' },
                    { id: 'resolved', label: 'Resolved' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                        style={activeTab === tab.id
                          ? { backgroundColor: '#571bc1', color: '#c4abff', boxShadow: '0 0 12px rgba(87,27,193,0.3)' }
                          : { color: '#8e90a2' }
                        }
                    >
                        {tab.label}
                    </button>
                ))}
             </div>
          </div>

          {/* Ticket Stats Strip */}
          <div className="flex gap-4 mb-6">
             <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8e90a2' }}>
                 {tickets.length} {activeTab === 'active' ? 'Active Tasks' : 'Resolved Records'}
             </span>
          </div>

          {/* Ticket List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <TicketCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
                <div className="lg:col-span-2">
                    <EmptyState
                    icon={<Coffee className="w-8 h-8" />}
                    title={activeTab === 'active' ? "Pause Café !" : "Aucun historique"}
                    description={
                        search 
                            ? `Aucun ticket pour "${search}"`
                            : activeTab === 'active' 
                                ? "Votre file d'attente est vide. Prenez un moment pour respirer."
                                : "Vous n'avez pas encore de tickets résolus."
                    }
                    className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800"
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
                    onAction={activeTab === 'active' ? resolveTicket : undefined}
                    actionLabel="Resolve"
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
