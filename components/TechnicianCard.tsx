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
            <h3 className="text-sm font-semibold text-gray-900 truncate">{technician.name}</h3>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Wrench className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400 truncate">{technician.specialty}</span>
          </div>
        </div>

        {/* Status */}
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0',
            technician.available
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-gray-100 text-gray-400'
          )}
        >
          <CheckCircle className="w-3 h-3" />
          {technician.available ? 'Available' : 'Busy'}
        </div>
      </div>
    </Card>
  )
}
