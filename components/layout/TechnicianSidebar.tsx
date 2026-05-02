'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, 
  Search, 
  ClipboardList, 
  UserCircle,
  ShieldCheck, 
  LogOut, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sun, 
  Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/lib/context/SidebarContext'
import { useTheme } from '@/lib/context/ThemeContext'

const techNavItems = [
  { href: '/technician-portal/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/technician-portal/my-tickets', label: 'My Tickets', icon: ClipboardList },
  { href: '/technician-portal/pool',       label: 'Open Pool', icon: Search },
  { href: '/technician-portal/profile',    label: 'Profile', icon: UserCircle },
]

export default function TechnicianSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { isOpen, toggle, close } = useSidebar()
  const { theme, toggleTheme } = useTheme()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/technician-portal/login')
  }

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
          'fixed left-3 top-3 bottom-3 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/50 rounded-2xl',
          'flex flex-col transition-all duration-300',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)]',
          isOpen ? 'md:w-64' : 'md:w-16',
        )}
      >
        {/* Logo row */}
        <div className={cn(
          'flex items-center border-b border-slate-200 dark:border-slate-800 transition-all duration-300',
          isOpen ? 'justify-between px-5 py-5' : 'justify-center px-2 py-5',
        )}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-amber-500 flex items-center justify-center shadow-md shadow-amber-900/50">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className={cn(
              'text-lg font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap transition-all duration-200',
              isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden md:block',
            )}>
              IT-Fix <span className="text-amber-500 text-[10px] uppercase tracking-tighter ml-1">Tech</span>
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

        {/* Scrollable Content Wrapper */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {/* Nav links */}
          <nav className="flex-1 px-2 py-4 space-y-0.5">
            {techNavItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  onClick={() => { if (window.innerWidth < 768) close() }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    !isOpen && 'md:justify-center md:px-2',
                    isActive
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
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
          <div className="px-2 py-2 border-t border-slate-200 dark:border-slate-800 space-y-0.5 mt-auto">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={cn(
                'flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-semibold border border-transparent transition-all duration-200',
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
                'flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium border border-transparent',
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
                'hidden md:flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium border border-transparent',
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

          {/* System Status - Premium Touch */}
          {isOpen && (
              <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                  <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-200 dark:border-slate-800/50 shadow-inner">
                      <div className="flex items-center gap-2.5">
                          <div className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </div>
                          <div className="flex-1">
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Network Status</p>
                              <p className="text-[10px] font-bold text-slate-900 dark:text-slate-200 leading-none">All Systems Operational</p>
                          </div>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </aside>
    </>
  )
}
