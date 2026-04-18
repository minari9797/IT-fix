'use client'

import { Zap, Bell, Menu } from 'lucide-react'
import { useSidebar } from '@/lib/context/SidebarContext'

interface TopbarProps {
  title?: string
}

export default function Topbar({ title }: TopbarProps) {
  const { toggle } = useSidebar()

  return (
    // Mobile only
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 md:hidden transition-colors duration-300">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            id="topbar-menu-btn"
            aria-label="Open menu"
            className="w-10 h-10 -ml-2 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{title || 'IT-Fix'}</span>
          </div>
        </div>
        <button
          id="topbar-notifications-btn"
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>
      </div>
    </header>
  )
}
