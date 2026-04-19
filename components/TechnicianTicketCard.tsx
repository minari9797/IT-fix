'use client'

import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import { PRIORITY_CONFIG, timeAgo, cn } from '@/lib/utils'
import { User, Image as ImageIcon, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Ticket {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  image_url: string | null
  technician_id: string | null
  profiles?: { full_name: string } | null
}

interface TechnicianTicketCardProps {
  ticket: Ticket
  onAction?: (ticketId: string) => void
  actionLabel?: string
  actionIcon?: React.ReactNode
  variant?: 'amber' | 'blue'
}

export default function TechnicianTicketCard({ 
  ticket, 
  onAction, 
  actionLabel, 
  actionIcon,
  variant = 'amber'
}: TechnicianTicketCardProps) {
  const router = useRouter()
  const priorityCfg = PRIORITY_CONFIG[ticket.priority]

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAction) onAction(ticket.id)
  }

  return (
    <Card hover onClick={() => router.push(`/tickets/${ticket.id}`)} className="group">
      <div className="flex gap-4">
        {/* Image preview */}
        {ticket.image_url ? (
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-900/50">
            <img
              src={ticket.image_url}
              alt="ticket screenshot"
              className="w-full h-full object-cover grayscale-[0.2]"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl flex-shrink-0 bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest', priorityCfg.color)}>
                        {priorityCfg.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{timeAgo(ticket.created_at)}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {ticket.title}
                </h3>
            </div>
            {onAction ? (
                <button 
                    onClick={handleAction}
                    className={cn(
                        "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-opacity-20",
                        variant === 'amber' 
                            ? "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-900/40" 
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40"
                    )}
                >
                    {actionIcon || <ArrowRight className="w-3 h-3" />}
                    {actionLabel || 'Action'}
                </button>
            ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-1" />
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed mt-1">
            {ticket.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                 <User className="w-3 h-3 text-slate-500" />
              </div>
              <span className="truncate max-w-[150px] font-bold">
                {ticket.profiles?.full_name || 'Anonymous User'}
              </span>
            </div>
            <StatusBadge status={ticket.status} size="sm" />
          </div>
        </div>
      </div>
    </Card>
  )
}
