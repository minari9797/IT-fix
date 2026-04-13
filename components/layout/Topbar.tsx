'use client'

import { Zap, Bell, Menu } from 'lucide-react'
import { useSidebar } from '@/lib/context/SidebarContext'

interface TopbarProps {
  title?: string
}

export default function Topbar({ title }: TopbarProps) {
  const { toggle } = useSidebar()

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggle}
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">{title || 'IT-Fix'}</span>
        </div>
      </div>
      <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
        <Bell className="w-4.5 h-4.5 text-gray-500" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
      </button>
    </header>
  )
}
