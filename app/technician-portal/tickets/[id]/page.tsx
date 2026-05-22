'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/lib/context/SidebarContext'
import { useTechnician } from '@/lib/hooks'
import TechnicianTopbar from '@/components/layout/TechnicianTopbar'
import StatusBadge from '@/components/ui/StatusBadge'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

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
    // Auth redirect removed — open access
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
    // Update local state immediately for instant UX feedback
    if (updates.status) setStatus(updates.status as Ticket['status'])
    if (updates.priority) setPriority(updates.priority as Ticket['priority'])
    setTicket(prev => prev ? { ...prev, ...updates } : null)

    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      toast.error('Failed to update system record')
      fetchTicket()
    } else if (!data || data.length === 0) {
      toast.error('Update blocked by permissions — contact admin')
      fetchTicket()
    } else {
      toast.success('Ticket synchronized successfully')
      // Update local ticket with confirmed DB data
      setTicket(prev => prev ? { ...prev, ...data[0] } : null)
      setStatus(data[0].status)
      setPriority(data[0].priority)
      setInternalNotes(data[0].internal_notes || '')
      setResolutionSummary(data[0].resolution_summary || '')
    }
    setSaving(false)
  }

  const handleClaim = async () => {
    setSaving(true)
    // Update local state immediately
    setStatus('in_progress')
    setTicket(prev => prev ? { ...prev, technician_id: technician.id, status: 'in_progress' } : null)

    const { data, error } = await supabase
      .from('tickets')
      .update({
        technician_id: technician.id,
        status: 'in_progress'
      })
      .eq('id', id)
      .select()

    if (error) {
      toast.error('Could not claim asset')
      fetchTicket()
    } else if (!data || data.length === 0) {
      toast.error('Claim blocked by permissions — contact admin')
      fetchTicket()
    } else {
      toast.success('Ticket claimed. Priority established.')
      setTicket(prev => prev ? { ...prev, ...data[0] } : null)
    }
    setSaving(false)
  }

  // Auth loading gate removed — open access

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#131315' }}>
      <TechnicianTopbar title={`Ticket #${id?.toString().substring(0, 8)}`} />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl mx-auto">

          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <button
                onClick={() => router.back()}
                className="text-xs font-semibold text-slate-600 hover:text-slate-300 transition-all uppercase tracking-widest"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-black text-white tracking-tight mt-2">
                Manage Incident
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {status === 'pending' && !ticket?.technician_id && (
                <button
                  onClick={handleClaim}
                  disabled={saving}
                  className="text-purple-400 hover:text-purple-300 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  Claim Assignment
                </button>
              )}
              {status !== 'resolved' && ticket?.technician_id === technician.id && (
                <button
                  onClick={() => handleUpdate({ status: 'resolved' })}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-widest transition-all rounded disabled:opacity-40"
                >
                  Finalize Resolution
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-32 w-full rounded-lg bg-slate-800/50" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-96 rounded-lg bg-slate-800/50" />
                <div className="h-96 rounded-lg bg-slate-800/50" />
              </div>
            </div>
          ) : ticket ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">

              {/* LEFT COLUMN: Ticket Content */}
              <div className="lg:col-span-8 space-y-6">

                {/* Visual Header */}
                <Card className="p-5">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <StatusBadge status={status} />
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-widest',
                      priority === 'high' ? 'text-purple-400' :
                      priority === 'medium' ? 'text-blue-400' :
                      'text-slate-500'
                    )}>
                      {priority} Priority
                    </span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight leading-tight mb-2" style={{ color: '#e5e1e4' }}>
                    {ticket.title}
                  </h2>
                  <p className="uppercase tracking-widest text-[10px]" style={{ color: '#434656' }}>
                    UID: {ticket.id}
                  </p>
                </Card>

                {/* Description & Assets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-5">
                    <p className="uppercase tracking-widest text-[10px] font-bold mb-3" style={{ color: '#8e90a2' }}>Description</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#c4c5d9' }}>
                      {ticket.description}
                    </p>
                  </Card>

                  <Card className="p-5">
                    <p className="uppercase tracking-widest text-[10px] font-bold mb-3" style={{ color: '#8e90a2' }}>Visual Asset</p>
                    <div className="flex items-center justify-center min-h-[160px]">
                      {ticket.image_url ? (
                        <img src={ticket.image_url} alt="Problem" className="rounded max-h-[260px] object-contain" />
                      ) : (
                        <p className="uppercase tracking-widest text-xs" style={{ color: '#434656' }}>No image attached</p>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Work Logs */}
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="uppercase tracking-widest text-[10px] font-bold" style={{ color: '#8e90a2' }}>Work Logs & Notes</p>
                    <button
                      onClick={() => handleUpdate({
                        internal_notes: internalNotes,
                        resolution_summary: resolutionSummary
                      })}
                      disabled={saving}
                      className="text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-40"
                      style={{ color: '#d0bcff' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#e9ddff' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#d0bcff' }}
                    >
                      Save Changes
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="uppercase tracking-widest text-[10px] font-bold" style={{ color: '#8e90a2' }}>Internal Notes (Private)</label>
                      <textarea
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        onBlur={() => handleUpdate({ internal_notes: internalNotes })}
                        placeholder="Log technical details here..."
                        className="w-full min-h-[100px] rounded-xl p-3 text-sm outline-none resize-none transition-all duration-200"
                        style={{ backgroundColor: '#1c1b1d', border: '1px solid rgba(255,255,255,0.06)', color: '#e5e1e4' }}
                        onFocus={(e) => { e.target.style.borderColor = '#d0bcff' }}
                        onBlur={(e) => { handleUpdate({ internal_notes: internalNotes }); e.target.style.borderColor = 'rgba(255,255,255,0.06)' }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="uppercase tracking-widest text-[10px] font-bold" style={{ color: '#8e90a2' }}>Resolution Summary</label>
                      <textarea
                        value={resolutionSummary}
                        onChange={(e) => setResolutionSummary(e.target.value)}
                        placeholder="Describe the final solution..."
                        className="w-full min-h-[100px] rounded-xl p-3 text-sm outline-none resize-none transition-all duration-200"
                        style={{ backgroundColor: '#1c1b1d', border: '1px solid rgba(255,255,255,0.06)', color: '#e5e1e4' }}
                        onFocus={(e) => { e.target.style.borderColor = '#d0bcff' }}
                        onBlur={(e) => { handleUpdate({ resolution_summary: resolutionSummary }); e.target.style.borderColor = 'rgba(255,255,255,0.06)' }}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* RIGHT COLUMN: Controls & User Meta */}
              <div className="lg:col-span-4 space-y-6">

                {/* Record Controls */}
                <Card className="p-5 space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="uppercase tracking-widest text-[10px] font-bold" style={{ color: '#8e90a2' }}>Priority</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(['low', 'medium', 'high'] as const).map(p => (
                          <button
                            key={p}
                            disabled={saving}
                            onClick={() => handleUpdate({ priority: p })}
                            className="py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                            style={priority === p
                              ? { backgroundColor: '#2e5bff', color: '#efefff', border: '1px solid transparent' }
                              : { backgroundColor: 'transparent', color: '#8e90a2', border: '1px solid rgba(255,255,255,0.08)' }
                            }
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="uppercase tracking-widest text-[10px] font-bold" style={{ color: '#8e90a2' }}>Status</p>
                      <div className="flex flex-col gap-2">
                        {(['pending', 'in_progress', 'resolved'] as const).map(s => (
                          <button
                            key={s}
                            disabled={saving}
                            onClick={() => handleUpdate({ status: s })}
                            className="px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-left"
                            style={status === s
                              ? { backgroundColor: '#571bc1', color: '#c4abff', border: '1px solid transparent' }
                              : { backgroundColor: 'transparent', color: '#8e90a2', border: '1px solid rgba(255,255,255,0.08)' }
                            }
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="uppercase tracking-widest text-[10px] font-bold mb-1" style={{ color: '#8e90a2' }}>Submitted</p>
                    <p className="text-xs font-semibold" style={{ color: '#c4c5d9' }}>{new Date(ticket.created_at).toLocaleDateString()}</p>
                  </div>
                </Card>

                {/* Requester Identity */}
                <Card className="p-5 space-y-4">
                  <p className="uppercase tracking-widest text-[10px] font-bold" style={{ color: '#8e90a2' }}>Requester</p>

                  <div>
                    <p className="text-base font-extrabold leading-tight" style={{ color: '#e5e1e4' }}>
                      {ticket.profiles?.full_name || 'Anonymous User'}
                    </p>
                    <p className="uppercase tracking-widest text-[10px] mt-0.5" style={{ color: '#b8c3ff' }}>User</p>
                  </div>

                  <div className="pt-3 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="uppercase tracking-widest text-[10px] font-bold mb-0.5" style={{ color: '#434656' }}>Contact</p>
                      <p className="text-xs font-semibold truncate" style={{ color: '#c4c5d9' }}>{ticket.profiles?.email || '—'}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-widest text-[10px] font-bold mb-0.5" style={{ color: '#434656' }}>Account UID</p>
                      <p className="text-[10px] truncate" style={{ color: '#434656' }}>{ticket.user_id}</p>
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
