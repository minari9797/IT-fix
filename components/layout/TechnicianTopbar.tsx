'use client'

import { useSidebar } from '@/lib/context/SidebarContext'
import { useTechnician } from '@/lib/hooks'
import { Menu, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title: string
}

export default function TechnicianTopbar({ title }: TopbarProps) {
  const { toggle, isOpen } = useSidebar()
  const { technician, loading } = useTechnician()

  return (
    <header className={cn(
      "h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30 flex items-center justify-between px-4 sticky top-0 transition-all duration-300",
      isOpen ? "md:ml-64" : "md:ml-16"
    )}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {!loading && technician && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">{technician.name}</p>
              <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-1 uppercase tracking-wider">{technician.specialty}</p>
            </div>
            {technician.avatar_url ? (
              <img
                src={technician.avatar_url}
                alt={technician.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-amber-500/20 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                <UserCircle className="w-5 h-5" />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
