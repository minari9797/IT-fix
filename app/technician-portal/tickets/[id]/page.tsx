'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  AlertCircle, 
  Image as ImageIcon, 
  MessageSquare,
  ClipboardList,
  Save,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Mail,
  Zap,
  Tag
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/lib/context/SidebarContext'
import { useTechnician } from '@/lib/hooks'
import TechnicianTopbar from '@/components/layout/TechnicianTopbar'
import StatusBadge from '@/components/ui/StatusBadge'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
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
  user_id: string
  internal_notes: string | null
  resolution_summary: string | null
  profiles: { full_name: string; email: string; avatar_url: string | null } | null
}

export default function TechnicianTicketDetail() {
  const { id } = useParams()
  const { isOpen } = useSidebar()
  const { technician, loading: authLoading } = useTechnician()
  const router = useRouter()
  
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form State
  const [internalNotes, setInternalNotes] = useState('')
  const [resolutionSummary, setResolutionSummary] = useState('')
  const [priority, setPriority] = useState<Ticket['priority']>('medium')
  const [status, setStatus] = useState<Ticket['status']>('pending')

  useEffect(() => {
    if (!authLoading && !technician) router.push('/technician-portal/login')
  }, [technician, authLoading, router])

  useEffect(() => {
    if (!technician || !id) return
    fetchTicket()
  }, [id, technician])

  const fetchTicket = async () => {
    setLoading(true)
    try {
      // Fetch ticket first
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        toast.error('Ticket record not found in central database')
        return
      }

      setTicket(data)
      setInternalNotes(data.internal_notes || '')
      setResolutionSummary(data.resolution_summary || '')
      setPriority(data.priority)
      setStatus(data.status)

      // Fetch profile separately to avoid join errors if FKs aren't perfectly aligned
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', data.user_id)
        .single()
      
      if (profileData) {
        setTicket(prev => prev ? { ...prev, profiles: profileData } : null)
      }
    } catch (err) {
      toast.error('Critical system error during data retrieval')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (updates: Partial<Ticket>) => {
    setSaving(true)
    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)

    if (error) {
      toast.error('Failed to update system record')
    } else {
      toast.success('Ticket synchronized successfully')
      fetchTicket()
    }
    setSaving(false)
  }

  const handleClaim = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('tickets')
      .update({ 
        technician_id: technician.id,
        status: 'in_progress'
      })
      .eq('id', id)

    if (error) toast.error('Could not claim asset')
    else {
      toast.success('Ticket claimed. Priority established.')
      fetchTicket()
    }
    setSaving(false)
  }

  if (authLoading || !technician) return null

  return (
    <div className="min-h-screen uppercase-first">
      <TechnicianTopbar title={`Ticket #${id?.toString().substring(0, 8)}`} />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl mx-auto">
          
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="group">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-amber-500 transition-all uppercase tracking-widest"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Base
              </button>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-2">
                Manage Incident Record
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {ticket?.status === 'pending' && !ticket.technician_id && (
                <button
                  onClick={handleClaim}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-900/40 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Claim Assignment
                </button>
              )}
              {ticket?.status !== 'resolved' && ticket?.technician_id === technician.id && (
                <button
                  onClick={() => handleUpdate({ status: 'resolved' })}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/40 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finalize Resolution
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
                    <Skeleton className="h-96 rounded-2xl" />
                </div>
            </div>
          ) : ticket ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* LEFT COLUMN: Ticket Content */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Header */}
                <Card className="p-8 border-amber-500/10 shadow-xl shadow-amber-950/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                            <ClipboardList className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <StatusBadge status={ticket.status} />
                                <span className={cn('text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border shadow-sm', PRIORITY_CONFIG[ticket.priority].color)}>
                                    {ticket.priority} Priority
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-2">
                                {ticket.title}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic">
                                UID: {ticket.id}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Description & Assets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-0 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-amber-500" />
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Internal Narrative</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </div>
                    </Card>

                    <Card className="p-0 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-amber-500" />
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Asset</h3>
                        </div>
                        <div className="p-4 flex items-center justify-center min-h-[200px]">
                            {ticket.image_url ? (
                                <img src={ticket.image_url} alt="Problem" className="rounded-lg max-h-[300px] object-contain shadow-2xl" />
                            ) : (
                                <div className="text-slate-400 dark:text-slate-600 flex flex-col items-center gap-2">
                                    <ShieldAlert className="w-8 h-8 opacity-20" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">No Visual Data</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Internal Workspace */}
                <Card className="p-0 border-amber-500/20 shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-amber-600" />
                            <h3 className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">Work Logs & System Notes</h3>
                        </div>
                        <button 
                            onClick={handleUpdate}
                            disabled={saving}
                            className="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                            <Save className="w-3 h-3" />
                            {saving ? 'Syncing...' : 'Sync Logs'}
                        </button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Progress Notes (Private)</label>
                            <textarea 
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                onBlur={() => handleUpdate({ internal_notes: internalNotes })}
                                placeholder="Log technical details, IP addresses, or internal hurdles here..."
                                className="w-full min-h-[120px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resolution Summary (Post-Mortem)</label>
                            <textarea 
                                value={resolutionSummary}
                                onChange={(e) => setResolutionSummary(e.target.value)}
                                onBlur={() => handleUpdate({ resolution_summary: resolutionSummary })}
                                placeholder="Describe the final solution implementation..."
                                className="w-full min-h-[120px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none shadow-inner"
                            />
                        </div>
                    </div>
                </Card>
              </div>

              {/* RIGHT COLUMN: Controls & User Meta */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Record Controls */}
                <Card className="p-6 space-y-6 shadow-xl border-slate-200 dark:border-slate-800">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Priority</p>
                            <div className="grid grid-cols-3 gap-2">
                                {['low', 'medium', 'high'].map(p => (
                                    <button
                                        key={p}
                                        disabled={saving}
                                        onClick={() => handleUpdate({ priority: p as any })}
                                        className={cn(
                                            "py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                                            priority === p 
                                                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-lg" 
                                                : "text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow State</p>
                            <div className="flex flex-col gap-2">
                                {['pending', 'in_progress', 'resolved'].map(s => (
                                    <button
                                        key={s}
                                        disabled={saving}
                                        onClick={() => handleUpdate({ status: s as any })}
                                        className={cn(
                                            "px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-between group",
                                            status === s 
                                                ? "bg-amber-500 text-white shadow-lg shadow-amber-900/20" 
                                                : "bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {s === 'pending' && <Clock className="w-4 h-4" />}
                                            {s === 'in_progress' && <Zap className="w-4 h-4" />}
                                            {s === 'resolved' && <CheckCircle2 className="w-4 h-4" />}
                                            {s.replace('_', ' ')}
                                        </div>
                                        {status === s && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-inner">
                            <Calendar className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Record Timestamp</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{formatDate(ticket.created_at)}</p>
                        </div>
                    </div>
                </Card>

                {/* Requester Identity */}
                <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End-User Profile</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-900/40 border-2 border-white/20">
                                {ticket.profiles?.full_name?.[0].toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight truncate leading-tight">
                                    {ticket.profiles?.full_name || 'Anonymous User'}
                                </p>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Requester Identity Verified</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Contact Point</p>
                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{ticket.profiles?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                                <User className="w-4 h-4 text-slate-400" />
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Account UID</p>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate tracking-tight">{ticket.user_id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

              </div>

            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
