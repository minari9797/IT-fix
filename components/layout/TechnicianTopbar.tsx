'use client'

import { useSidebar } from '@/lib/context/SidebarContext'

interface TopbarProps {
  title?: string
}

export default function TechnicianTopbar({ title }: TopbarProps) {
  const { toggle } = useSidebar()

  return (
    <header
      className="sticky top-0 z-30 md:hidden"
      style={{ backgroundColor: '#131315', borderBottom: '1px solid rgba(67,70,86,0.6)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            id="topbar-menu-btn"
            aria-label="Open menu"
            className="text-lg leading-none transition-colors"
            style={{ color: '#8e90a2' }}
          >
            ☰
          </button>
          {/* secondary = #d0bcff (tech purple) */}
          <span className="text-sm font-black tracking-tight uppercase" style={{ color: '#d0bcff' }}>
            {title || 'TECH PORTAL'}
          </span>
        </div>
      </div>
    </header>
  )
}
