'use client'

import Card from '@/components/ui/Card'
import { CheckCircle, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Technician {
  id: string
  name: string
  specialty: string
  available: boolean
  avatar_url: string | null
}

interface TechnicianCardProps {
  technician: Technician
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-orange-400 to-red-500',
  'from-yellow-400 to-orange-500',
]

export default function TechnicianCard({ technician }: TechnicianCardProps) {
  const colorIdx = technician.name.charCodeAt(0) % AVATAR_COLORS.length
  const gradient = AVATAR_COLORS[colorIdx]

  return (
    <Card hover>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {technician.avatar_url ? (
          <img
            src={technician.avatar_url}
            alt={technician.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br text-white text-sm font-bold',
              gradient
            )}
          >
            {getInitials(technician.name)}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{technician.name}</h3>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Wrench className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{technician.specialty}</span>
          </div>
        </div>

        {/* Status */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 border',
            technician.available
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 border-slate-200 dark:border-slate-700'
          )}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          {technician.available ? 'Available' : 'Busy'}
        </div>
      </div>
    </Card>
  )
}
