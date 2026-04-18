'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, PlusCircle, Users, UserCircle,
  Zap, LogOut, X, Shield, ChevronLeft, ChevronRight,
  Sun, Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/lib/context/SidebarContext'
import { useUser } from '@/lib/hooks'
import { useTheme } from '@/lib/context/ThemeContext'

const navItems = [
  { href: '/dashboard',     label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create-ticket', label: 'New Ticket',  icon: PlusCircle },
  { href: '/technicians',   label: 'Technicians', icon: Users },
  { href: '/profile',       label: 'Profile',     icon: UserCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { isOpen, toggle, close } = useSidebar()
  const { isAdmin } = useUser()
  const { theme, toggleTheme } = useTheme()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const allItems = [
    ...navItems,
    ...(isAdmin ? [{ href: '/admin', label: 'Admin Console', icon: Shield }] : []),
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={close}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
          'flex flex-col transition-all duration-300',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isOpen ? 'md:w-64' : 'md:w-16',
        )}
      >
        {/* Logo row */}
        <div className={cn(
          'flex items-center border-b border-slate-200 dark:border-slate-800 transition-all duration-300',
          isOpen ? 'justify-between px-5 py-5' : 'justify-center px-2 py-5',
        )}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/50">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className={cn(
              'text-lg font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap transition-all duration-200',
              isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden md:block',
            )}>
              IT-Fix
            </span>
          </div>

          {/* Mobile close */}
          <button
            onClick={close}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
          {allItems.map(({ href, label, icon: Icon }) => {
            const isActive  = pathname === href
            const isAdminLk = href === '/admin'
            return (
              <Link
                key={href}
                href={href}
                title={label}
                onClick={() => { if (window.innerWidth < 768) close() }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  !isOpen && 'md:justify-center md:px-2',
                  isActive
                    ? isAdminLk
                      ? 'bg-purple-600/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent',
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={cn(
                  'whitespace-nowrap transition-all duration-200 overflow-hidden',
                  isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 md:hidden',
                )}>
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Theme toggle, Sign out + collapse */}
        <div className="px-2 py-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-semibold border border-transparent transition-all duration-200',
              'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
              !isOpen && 'md:justify-center md:px-2',
            )}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            <span className={cn(
              'whitespace-nowrap transition-all duration-200 overflow-hidden',
              isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 md:hidden',
            )}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium border border-transparent',
              'text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200',
              !isOpen && 'md:justify-center md:px-2',
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={cn(
              'whitespace-nowrap transition-all duration-200 overflow-hidden',
              isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 md:hidden',
            )}>
              Sign Out
            </span>
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={toggle}
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className={cn(
              'hidden md:flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium border border-transparent',
              'text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-300 transition-all duration-200',
              !isOpen && 'md:justify-center md:px-2',
            )}
          >
            {isOpen
              ? <><ChevronLeft className="w-5 h-5 flex-shrink-0" /><span className="whitespace-nowrap">Collapse</span></>
              : <ChevronRight className="w-5 h-5 flex-shrink-0" />
            }
          </button>
        </div>
      </aside>
    </>
  )
}
