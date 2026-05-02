'use client'

import { Wrench, Mail, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Technician {
  id: string
  name: string
  email: string
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

const ACCENT_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-yellow-500',
]

export default function TechnicianCard({ technician }: TechnicianCardProps) {
  const colorIdx = technician.name.charCodeAt(0) % AVATAR_COLORS.length
  const gradient = AVATAR_COLORS[colorIdx]
  const accent = ACCENT_COLORS[colorIdx]

  return (
    <div
      className={cn(
        'relative group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700',
        'shadow-sm p-6 transition-all duration-300 cursor-default overflow-hidden',
        'hover:shadow-xl hover:shadow-blue-900/10 dark:hover:shadow-blue-500/5',
        'hover:border-slate-300 dark:hover:border-slate-600',
        'hover:-translate-y-1'
      )}
    >
      {/* Top accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-all duration-300', accent, 'opacity-60 group-hover:opacity-100')} />

      {/* Header: Avatar + Name + Availability */}
      <div className="flex items-start gap-4 mb-5">
        {/* Avatar */}
        {technician.avatar_url ? (
          <img
            src={technician.avatar_url}
            alt={technician.name}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300"
          />
        ) : (
          <div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
              'bg-gradient-to-br text-white text-base font-bold shadow-md',
              'group-hover:shadow-lg group-hover:scale-105 transition-all duration-300',
              gradient
            )}
          >
            {getInitials(technician.name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {technician.name}
          </h3>
          {/* Availability Badge */}
          <div
            className={cn(
              'inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
              technician.available
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
            )}
          >
            {technician.available ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            {technician.available ? 'Available' : 'Busy'}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-700/60 mb-4" />

      {/* Info rows */}
      <div className="space-y-3">
        {/* Specialty */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Specialty</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{technician.specialty}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contact</p>
            <a
              href={`mailto:${technician.email}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-200 truncate block"
            >
              {technician.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
