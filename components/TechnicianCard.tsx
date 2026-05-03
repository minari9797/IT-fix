'use client'

interface Technician {
  id: string
  name: string
  email: string
  specialty: string
  available: boolean
  avatar_url: string | null
}

export default function TechnicianCard({ technician }: { technician: Technician }) {
  return (
    <div
      className="rounded-xl p-5 transition-all duration-200 border border-slate-700/50 shadow-sm"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
    >
      {/* Name + specialty */}
      <p className="text-base font-extrabold leading-snug mb-0.5" style={{ color: '#e5e1e4' }}>
        {technician.name}
      </p>
      <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#8e90a2' }}>
        {technician.specialty}
      </p>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="pt-4 space-y-3">
        {/* Availability */}
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: technician.available ? '#4ade80' : '#ffb4ab' }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: technician.available ? '#4ade80' : '#ffb4ab' }}
          >
            {technician.available ? 'Available' : 'Busy'}
          </span>
        </div>

        {/* Email */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#434656' }}>Contact</p>
          <a
            href={`mailto:${technician.email}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium transition-colors truncate block"
            style={{ color: '#b8c3ff' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#dde1ff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#b8c3ff' }}
          >
            {technician.email}
          </a>
        </div>
      </div>
    </div>
  )
}
