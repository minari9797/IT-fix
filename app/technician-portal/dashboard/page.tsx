'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheck, 
  CircleDot, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Inbox,
  Coffee,
  Server
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useTechnician } from '@/lib/hooks'
import { useSidebar } from '@/lib/context/SidebarContext'
import TechnicianTopbar from '@/components/layout/TechnicianTopbar'
import TechnicianTicketCard from '@/components/TechnicianTicketCard'
import Button from '@/components/ui/Button'
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
    <div className="min-h-screen">
      <TechnicianTopbar title="Command Center" />
      
      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-72" : "md:ml-20"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">
          
          {/* Hero Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">
                <ShieldCheck className="w-4 h-4" />
                Technician Level Access
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back, {technician.name.split(' ')[0]} 🛠️
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
              "Your specialty: {technician.specialty}"
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Card className="border-l-4 border-l-amber-500 shadow-md">
                <div className="flex items-center justify-between transition-transform">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Pool</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{poolCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-500 shadow-lg shadow-amber-900/20 rounded-xl flex items-center justify-center text-white">
                        <Inbox className="w-6 h-6" />
                    </div>
                </div>
            </Card>
            <Card className="border-l-4 border-l-blue-500 shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">My Active</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{myTickets.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 shadow-lg shadow-blue-900/20 rounded-xl flex items-center justify-center text-white">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>
            </Card>
            <Card className="border-l-4 border-l-emerald-500 shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resolved</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{resolvedCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500 shadow-lg shadow-emerald-900/20 rounded-xl flex items-center justify-center text-white">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Active Queue */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        My Active Queue
                    </h2>
                </div>
                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => <TicketCardSkeleton key={i} />)
                    ) : myTickets.length === 0 ? (
                        <EmptyState
                            icon={<Coffee className="w-8 h-8" />}
                            title="Pause Café !"
                            description="Votre file d'attente est vide. Prenez un moment pour respirer."
                            className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800"
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
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <CircleDot className="w-5 h-5 text-amber-500" />
                        Active Ticket Pool
                    </h2>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-md uppercase tracking-wider">Unassigned</span>
                </div>
                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => <TicketCardSkeleton key={i} />)
                    ) : poolTickets.length === 0 ? (
                        <EmptyState
                            icon={<Server className="w-8 h-8" />}
                            title="Pool Clean"
                            description="Aucun ticket en attente. L'équipe gère !"
                            className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800"
                        />
                    ) : (
                        poolTickets.map(ticket => (
                            <Card 
                                key={ticket.id} 
                                onClick={() => router.push(`/technician-portal/tickets/${ticket.id}`)}
                                className="relative group overflow-hidden border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                                                ticket.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                                                ticket.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' :
                                                'bg-slate-500/10 text-slate-500'
                                            )}>
                                                {ticket.priority}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{ticket.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ticket.description}</p>
                                    </div>
                                    <div className="ml-4">
                                        <button 
                                            onClick={() => takeTicket(ticket.id)}
                                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-md shadow-amber-900/20 active:scale-95 transition-all"
                                        >
                                            Take
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
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
