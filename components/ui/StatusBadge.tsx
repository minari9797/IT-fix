'use client'

import { STATUS_CONFIG } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled' | 'archived'
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
