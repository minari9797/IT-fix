'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useTechnician } from '@/lib/hooks'
import { useSidebar } from '@/lib/context/SidebarContext'
import TechnicianTopbar from '@/components/layout/TechnicianTopbar'
import TechnicianTicketCard from '@/components/TechnicianTicketCard'
import Card from '@/components/ui/Card'
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
  user_id: string
}

export default function TechnicianDashboard() {
  const { user, technician, loading: authLoading } = useTechnician()
  const router = useRouter()
  const { isOpen } = useSidebar()
  
  const [poolTickets, setPoolTickets] = useState<TicketRow[]>([])
  const [myTickets, setMyTickets] = useState<TicketRow[]>([])
  const [poolCount, setPoolCount] = useState(0)
  const [resolvedCount, setResolvedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !technician) {
      toast.error('Unauthorized access')
      router.push('/technician-portal/login')
    }
  }, [technician, authLoading, router])

  useEffect(() => {
    if (!technician) return
    fetchDashboardData()
  }, [technician])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch real pool count (no limit) for the metric card
      const { count: totalPoolCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .is('technician_id', null)
        .eq('status', 'pending')

      setPoolCount(totalPoolCount ?? 0)

      // Fetch resolved count for this technician
      const { count: totalResolved } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('technician_id', technician.id)
        .eq('status', 'resolved')

      setResolvedCount(totalResolved ?? 0)

      // Fetch Pool preview (limited to 5 for dashboard display)
      const { data: poolData, error: poolError } = await supabase
        .from('tickets')
        .select('*')
        .is('technician_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch My Tickets (Active — not resolved)
      const { data: myData, error: myError } = await supabase
        .from('tickets')
        .select('*')
        .eq('technician_id', technician.id)
        .neq('status', 'resolved')
        .order('created_at', { ascending: false })

      if (poolError || myError) throw new Error('Failed to fetch tickets')

      const allTickets = [...(poolData || []), ...(myData || [])]
      const userIds = Array.from(new Set(allTickets.map(t => t.user_id)))

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)
        
        if (profiles) {
          const mapProfiles = (t: any) => ({
            ...t,
            profiles: profiles.find(p => p.id === t.user_id) || null
          })
          setPoolTickets((poolData || []).map(mapProfiles))
          setMyTickets((myData || []).map(mapProfiles))
        } else {
          setPoolTickets(poolData || [])
          setMyTickets(myData || [])
        }
      } else {
        setPoolTickets(poolData || [])
        setMyTickets(myData || [])
      }
    } catch (err) {
      toast.error('Error loading command center')
    } finally {
      setLoading(false)
    }
  }

  const takeTicket = async (ticketId: string) => {
    if (!technician) return
    const { error } = await supabase
      .from('tickets')
      .update({ 
        technician_id: technician.id, 
        status: 'in_progress' 
      })
      .eq('id', ticketId)

    if (error) {
      toast.error('Could not assign ticket')
    } else {
      toast.success('Ticket assigned to you')
      fetchDashboardData()
    }
  }

  if (authLoading || !technician) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#131315' }}>
      <TechnicianTopbar title="Command Center" />
      
      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-72" : "md:ml-20"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">
          
          {/* Hero Header */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8e90a2' }}>System / Operational / Overview</p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#e5e1e4' }}>
              Welcome back, {technician.name.split(' ')[0]}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#d0bcff' }}>{technician.specialty}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Queue',  value: myTickets.length,                                               color: '#d0bcff' },
              { label: 'Pool Available',value: poolCount,                                                      color: '#c4c5d9' },
              { label: 'Resolved Total',value: resolvedCount,                                                  color: '#4ade80' },
              { label: 'In Progress',   value: myTickets.filter(t => t.status === 'in_progress').length,       color: '#b8c3ff' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-5 border border-slate-700/50 shadow-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-2xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#434656' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Active Queue */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8e90a2' }}>My Active Queue</h2>
                </div>
                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => <TicketCardSkeleton key={i} />)
                    ) : myTickets.length === 0 ? (
                        <EmptyState
                            title="Queue Clear"
                            description="Your active queue is empty."
                        />
                    ) : (
                        myTickets.map(ticket => (
                            <TechnicianTicketCard key={ticket.id} ticket={ticket as any} />
                        ))
                    )}
                </div>
            </section>

            {/* Global Ticket Pool */}
            <section>
                {/* Pool header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="uppercase tracking-widest text-xs text-slate-500">Open Pool</h2>
                    <span className="uppercase tracking-widest text-[10px] text-purple-400">Unassigned</span>
                </div>
                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => <TicketCardSkeleton key={i} />)
                    ) : poolTickets.length === 0 ? (
                        <EmptyState
                            title="Pool Clear"
                            description="No pending tickets in the pool."
                        />
                    ) : (
                        poolTickets.map(ticket => (
                            <Card
                                key={ticket.id}
                                onClick={() => router.push(`/technician-portal/tickets/${ticket.id}`)}
                                className="cursor-pointer group p-4 overflow-hidden"
                                hover
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                ticket.priority === 'high' ? 'text-purple-400' :
                                                ticket.priority === 'medium' ? 'text-blue-400' :
                                                'text-slate-500'
                                            )}>
                                                {ticket.priority}
                                            </span>
                                            <span className="uppercase tracking-widest text-[10px] text-slate-600">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">{ticket.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); takeTicket(ticket.id) }}
                                        className="ml-4 flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 active:scale-95"
                                        style={{ backgroundColor: '#571bc1', color: '#c4abff', boxShadow: '0 0 12px rgba(87,27,193,0.25)' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6d28d9'; e.currentTarget.style.boxShadow = '0 0 18px rgba(87,27,193,0.45)' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#571bc1'; e.currentTarget.style.boxShadow = '0 0 12px rgba(87,27,193,0.25)' }}
                                    >
                                        Take
                                    </button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
