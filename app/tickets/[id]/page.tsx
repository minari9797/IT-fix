'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Calendar, AlertCircle, Image as ImageIcon, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/lib/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import StatusBadge from '@/components/ui/StatusBadge'
import Card from '@/components/ui/Card'
import { PRIORITY_CONFIG, formatDate, cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'

type Ticket = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  image_url: string | null
  technician_id: string | null
  technicians?: { name: string; specialty: string } | null
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const { isOpen } = useSidebar()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, technicians(name, specialty)')
        .eq('id', id)
        .single()
      if (error) {
        toast.error('Ticket not found')
        router.push('/dashboard')
      } else {
        setTicket(data)
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  return (
    <div className="min-h-screen">
      <Sidebar />

      {/* Mobile Header (Topbar replacement) */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 flex items-center gap-4 md:hidden">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-slate-100 truncate tracking-tight">
          {loading ? 'Ticket...' : ticket?.title || 'Details'}
        </span>
      </header>

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-10 max-w-7xl">
          {/* Desktop Navigation Row */}
          <div className="hidden md:flex items-center gap-6 mb-8 group">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-100 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-slate-600 transition-colors shadow-sm">
                <ArrowLeft className="w-4 h-4" />
              </div>
              Back to Dashboard
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-3 min-w-0">
               <h1 className="text-xl font-bold text-slate-100 truncate tracking-tight">
                {loading ? 'Loading...' : ticket?.title || 'Ticket Detail'}
              </h1>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
          ) : ticket ? (
            // Responsive Content Grid
            <div className="flex flex-col lg:flex-row lg:items-start gap-8 animate-fade-in">

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 space-y-6 min-w-0">
                {/* Status/Priority Banner (Mobile Only) */}
                <div className="flex flex-wrap items-center gap-3 lg:hidden mb-2">
                   <StatusBadge status={ticket.status} />
                   <span className={cn('text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border border-slate-700 bg-slate-800', PRIORITY_CONFIG[ticket.priority].color)}>
                    {PRIORITY_CONFIG[ticket.priority].label} Priority
                  </span>
                </div>

                {/* Description Card */}
                <Card className="p-0 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Problem Description</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-base text-slate-200 leading-relaxed whitespace-pre-wrap font-medium tracking-tight">
                      {ticket.description}
                    </p>
                  </div>
                </Card>

                {/* Screenshot/Attachment Card */}
                {ticket.image_url && (
                  <Card className="p-0 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visual Evidence</h2>
                    </div>
                    <div className="p-6 bg-slate-900/50">
                      <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
                        <img
                          src={ticket.image_url}
                          alt="problem screenshot"
                          className="w-full object-contain max-h-[500px]"
                        />
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* SIDEBAR INFORMATION */}
              <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                {/* Meta Panel (Status/Time) */}
                <Card className="space-y-5 p-6 shadow-xl shadow-blue-900/5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Status</p>
                      <div className="flex">
                        <StatusBadge status={ticket.status} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority Ranking</p>
                      <div className="flex">
                         <span className={cn('text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-slate-700/50 bg-slate-800/50', PRIORITY_CONFIG[ticket.priority].color)}>
                          {PRIORITY_CONFIG[ticket.priority].label} Level
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-700/50 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-700/30 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Submitted On</p>
                        <p className="text-xs font-semibold text-slate-300">{formatDate(ticket.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Assignment Panel */}
                <Card className="p-6 shadow-xl shadow-blue-900/5">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Specialist</h2>
                  </div>
                  {ticket.technicians ? (
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-700 p-0.5 shadow-sm group-hover:border-blue-500/50 transition-colors">
                        <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-base font-bold shadow-inner">
                          {ticket.technicians.name[0].toUpperCase()}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-100 tracking-tight leading-tight">{ticket.technicians.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1 truncate">{ticket.technicians.specialty}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2 text-slate-500 italic">
                       <User className="w-5 h-5 opacity-30" />
                       <span className="text-sm font-medium">Pending assignment...</span>
                    </div>
                  )}
                </Card>
              </div>

            </div>
          ) : null}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
