'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/hooks'
import { useSidebar } from '@/lib/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import { PRIORITY_CONFIG, formatDate, cn } from '@/lib/utils'

type TicketWithUser = {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  user_id: string
  technician_id: string | null
  profiles: { full_name: string; email: string }
  technicians?: { name: string } | null
}

type Technician = {
  id: string
  name: string
}

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useUser()
  const { isOpen } = useSidebar()
  const router = useRouter()
  
  const [tickets, setTickets] = useState<TicketWithUser[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!authLoading && user && !isAdmin) {
      toast.error('Unauthorized access')
      router.push('/dashboard')
    }
  }, [isAdmin, user, authLoading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin])

  const fetchData = async () => {
    setLoading(true)
    const [ticketsRes, techsRes] = await Promise.all([
      supabase
        .from('tickets')
        .select('*, profiles(full_name, email), technicians(name)')
        .order('created_at', { ascending: false }),
      supabase
        .from('technicians')
        .select('id, name')
        .eq('available', true)
    ])

    if (ticketsRes.error) toast.error('Failed to load tickets')
    else setTickets(ticketsRes.data || [])

    if (techsRes.error) toast.error('Failed to load technicians')
    else setTechnicians(techsRes.data || [])

    setLoading(false)
  }

  const updateTicketStatus = async (id: string, status: TicketWithUser['status']) => {
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)
    
    if (error) toast.error('Update failed')
    else {
      toast.success(`Status updated to ${status}`)
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    }
  }

  const assignTechnician = async (ticketId: string, techId: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ technician_id: techId === 'unassigned' ? null : techId })
      .eq('id', ticketId)

    if (error) toast.error('Assignment failed')
    else {
      toast.success('Technician assigned')
      fetchData() // Refresh to get names
    }
  }

  const filtered = tickets.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.profiles.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.profiles.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || !isAdmin) return null

  return (
    <div className="min-h-screen uppercase-first">
      <Sidebar />
      <Topbar title="Admin Console" />

      <main className={cn(
        "pb-24 transition-all duration-300",
        isOpen ? "md:ml-72" : "md:ml-20"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-10 max-w-7xl">
          
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-md">
                  <Shield className="w-5 h-5 font-bold" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Admin Console</h1>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total control over system requests and team assignments</p>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Find tickets, users, or techs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 pl-11 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Priority & Ticket</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Contact Information</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status Control</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Tech Assignment</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-right pr-10">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-8 py-6"><div className="h-10 bg-slate-200 dark:bg-slate-700/30 rounded-lg w-full" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                           <Shield className="w-8 h-8 text-slate-700" />
                           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No matching records</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-all group">
                        <td className="px-6 py-6 border-l-2 border-transparent group-hover:border-blue-500">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                               <span className={cn('text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50', PRIORITY_CONFIG[ticket.priority].color)}>
                                {ticket.priority}
                               </span>
                               <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ticket.title}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formatDate(ticket.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">{ticket.profiles.full_name}</span>
                            <span className="text-xs font-medium text-slate-500 mt-0.5">{ticket.profiles.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-2">
                             <StatusBadge status={ticket.status} size="sm" />
                             <select 
                              value={ticket.status}
                              onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
                              className="text-[10px] font-bold text-slate-500 bg-transparent border-none focus:ring-0 p-0 cursor-pointer uppercase tracking-widest hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            >
                              <option value="pending">Mark Pending</option>
                              <option value="in_progress">Mark In Progress</option>
                              <option value="resolved">Mark Resolved</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3 group/tech">
                            <div className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center border transition-all shadow-inner",
                                ticket.technician_id ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-100 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700 text-slate-500"
                            )}>
                              {ticket.technicians ? <span className="font-bold text-xs">{ticket.technicians.name[0]}</span> : <UserPlus className="w-4 h-4" />}
                            </div>
                            <select
                              value={ticket.technician_id || 'unassigned'}
                              onChange={(e) => assignTechnician(ticket.id, e.target.value)}
                              className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none hover:border-blue-500 transition-all focus:ring-2 focus:ring-blue-500/20"
                            >
                              <option value="unassigned">RE-ASSIGN</option>
                              {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name.toUpperCase()}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right pr-8">
                          <Button 
                            onClick={() => router.push(`/tickets/${ticket.id}`)}
                            variant="ghost" 
                            size="sm"
                            className="bg-slate-100 dark:bg-slate-700/30 hover:bg-blue-600 hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            REVIEW
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>


    </div>
  )
}
