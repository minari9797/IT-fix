'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Rocket, 
  Search, 
  ArrowRight,
  Zap,
  Filter
} from 'lucide-react'
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
  status: 'pending' | 'in_progress' | 'resolved'
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

  const fetchPool = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tickets')
      .select('*, profiles(full_name)')
      .is('technician_id', null)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) toast.error('Failed to load ticket pool')
    else setTickets((data as any) || [])
    setLoading(false)
  }

  const claimTicket = async (id: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ 
        technician_id: technician.id, 
        status: 'in_progress' 
      })
      .eq('id', id)

    if (error) {
      toast.error('Could not claim ticket')
    } else {
      toast.success('Ticket claimed successfully')
      fetchPool()
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
    <div className="min-h-screen uppercase-first">
      <TechnicianTopbar title="Open Pool" />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">
                    <Rocket className="w-4 h-4" />
                    Real-time Intake
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Global Ticket Pool
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium italic">
                    Claim unassigned requests to increase your throughput
                </p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-none">
                    {tickets.length} Available Now
                </span>
            </div>
          </div>

          {/* Filtering */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search global pool..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 shadow-sm"
                />
             </div>
             <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-none">
                {['all', 'low', 'medium', 'high'].map(p => (
                    <button
                        key={p}
                        onClick={() => setPriorityFilter(p as any)}
                        className={cn(
                            "px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                            priorityFilter === p 
                                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg" 
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                        )}
                    >
                        {p} Priority
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
                    icon={<Inbox className="w-8 h-8" />}
                    title="Pool Exhausted"
                    description={
                        search 
                            ? `No unassigned tickets match "${search}"`
                            : "There are currently no unassigned tickets available."
                    }
                    action={
                        search ? (
                            <button onClick={() => {setSearch(''); setPriorityFilter('all')}} className="text-amber-500 font-bold text-sm uppercase tracking-widest mt-4">Reset Filters</button>
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
                    actionIcon={<Zap className="w-3 h-3" />}
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

function Inbox(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}
