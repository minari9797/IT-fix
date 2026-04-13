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
import MobileNav from '@/components/layout/MobileNav'
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
    // 1. If not loading and no user, go to login
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    // 2. If not loading and not admin, go to dashboard
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
    t.profiles.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || !isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50 uppercase-first">
      <Sidebar />
      <Topbar title="Admin Console" />

      <main className={cn(
        "pb-24 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-0"
      )}>
        <div className="px-4 pt-4 md:px-8 md:pt-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Admin Console</h2>
              </div>
              <p className="text-sm text-gray-400">Manage all tickets and technician assignments</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets or users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 overflow-x-auto shadow-sm rounded-2xl border border-gray-100 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-gray-50 rounded-lg w-full" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No tickets found</td>
                  </tr>
                ) : (
                  filtered.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 mb-0.5">{ticket.title}</span>
                          <span className="text-[10px] text-gray-400">{formatDate(ticket.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700">{ticket.profiles.full_name}</span>
                          <span className="text-xs text-gray-400">{ticket.profiles.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={ticket.status}
                          onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
                          className="text-xs font-medium bg-transparent border-none focus:ring-0 p-0 cursor-pointer text-gray-600 hover:text-gray-900"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <div className="mt-1">
                          <StatusBadge status={ticket.status} size="sm" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <UserPlus className="w-4 h-4" />
                          </div>
                          <select
                            value={ticket.technician_id || 'unassigned'}
                            onChange={(e) => assignTechnician(ticket.id, e.target.value)}
                            className="text-xs bg-white border border-gray-100 rounded-lg px-2 py-1 outline-none hover:border-purple-200 transition-colors"
                          >
                            <option value="unassigned">Unassigned</option>
                            {technicians.map(tech => (
                              <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => router.push(`/tickets/${ticket.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
