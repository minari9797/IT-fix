'use client'

import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import { PRIORITY_CONFIG, timeAgo, cn } from '@/lib/utils'
import { User, Image as ImageIcon, ChevronRight } from 'lucide-react'
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

interface TicketCardProps {
  ticket: Ticket
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const router = useRouter()
  const priorityCfg = PRIORITY_CONFIG[ticket.priority]

  return (
    <Card hover onClick={() => router.push(`/tickets/${ticket.id}`)}>
      <div className="flex gap-3">
        {/* Image preview */}
        {ticket.image_url ? (
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-900/50">
            <img
              src={ticket.image_url}
              alt="ticket screenshot"
              className="w-full h-full object-cover grayscale-[0.2]"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight line-clamp-1">
              {ticket.title}
            </h3>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {ticket.description}
          </p>

          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={ticket.status} size="sm" />
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', priorityCfg.color)}>
              {priorityCfg.label}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[100px] font-medium">
                {ticket.technicians?.name || 'Unassigned'}
              </span>
            </div>
            <span className="text-xs text-slate-500">{timeAgo(ticket.created_at)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
