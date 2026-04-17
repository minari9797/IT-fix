'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create-ticket', label: 'New', icon: PlusCircle },
  { href: '/technicians', label: 'Technicians', icon: Users },
  { href: '/profile', label: 'Profile', icon: UserCircle },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 min-w-[56px]',
                isActive
                  ? 'text-blue-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                  isActive && 'bg-blue-600/15 border border-blue-500/20'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'stroke-2')} />
              </div>
              <span className={cn('text-[10px] font-medium', isActive ? 'text-blue-400' : 'text-slate-500')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
