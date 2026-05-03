'use client'

import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled' | 'archived'
  size?: 'sm' | 'md'
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'bg-amber-500/15 text-amber-300 border border-amber-400/20' },
  in_progress: { label: 'In Progress', className: 'bg-[rgba(46,91,255,0.15)] text-[#b8c3ff] border border-[rgba(184,195,255,0.2)]' },
  resolved:    { label: 'Resolved',    className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20' },
  cancelled:   { label: 'Cancelled',   className: 'bg-white/5 text-[var(--outline)] border border-white/10' },
  archived:    { label: 'Archived',    className: 'bg-white/5 text-[var(--outline-var)] border border-white/[0.06]' },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_STYLES[status] ?? STATUS_STYLES.pending
  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-widest rounded-lg',
        cfg.className,
        size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
      )}
    >
      {cfg.label}
    </span>
  )
}
