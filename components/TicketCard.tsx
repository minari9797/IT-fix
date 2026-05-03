'use client'

import StatusBadge from '@/components/ui/StatusBadge'
import { timeAgo, cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Ticket {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled' | 'archived'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  image_url: string | null
  technician_id: string | null
  technicians?: { name: string } | null
}

const PRIORITY_DOT: Record<string, string> = {
  low:    '#8e90a2',
  medium: '#f59e0b',
  high:   '#ffb4ab',
}
const PRIORITY_LABEL: Record<string, { color: string; label: string }> = {
  low:    { color: '#8e90a2', label: 'Low' },
  medium: { color: '#f59e0b', label: 'Medium' },
  high:   { color: '#ffb4ab', label: 'Critical' },
}

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const router = useRouter()
  const p = PRIORITY_LABEL[ticket.priority] ?? PRIORITY_LABEL.low

  return (
    <div
      onClick={() => router.push(`/tickets/${ticket.id}`)}
      className="rounded-xl p-4 transition-all duration-200 cursor-pointer group border border-slate-700/50 shadow-sm"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_DOT[ticket.priority] }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: p.color }}>{p.label}</span>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: '#434656' }}>{timeAgo(ticket.created_at)}</span>
          </div>
          <h3 className="text-sm font-bold leading-snug line-clamp-1 transition-colors" style={{ color: '#e5e1e4' }}>
            {ticket.title}
          </h3>
          <p className="text-xs line-clamp-1 mt-0.5 uppercase tracking-wide" style={{ color: '#434656' }}>
            {ticket.description}
          </p>
        </div>
        {/* Right */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={ticket.status} size="sm" />
          <span className="text-sm transition-colors" style={{ color: '#434656' }}>›</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#8e90a2' }}>
          {ticket.technicians?.name || 'Unassigned'}
        </span>
        <span className="text-[10px] font-mono" style={{ color: '#434656' }}>
          #{ticket.id.substring(0, 8).toUpperCase()}
        </span>
      </div>
    </div>
  )
}
