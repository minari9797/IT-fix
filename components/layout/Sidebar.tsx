'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, PlusCircle, Users,
  Zap, LogOut, X, Shield, ChevronLeft, ChevronRight,
  Sun, Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/lib/context/SidebarContext'
import { useUser } from '@/lib/hooks'
import { useTheme } from '@/lib/context/ThemeContext'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create-ticket', label: 'New Ticket', icon: PlusCircle },
  { href: '/technicians', label: 'Technicians', icon: Users },
]

// sidebar bg: surface-container-low = #1c1b1d
// border: outline-variant = #434656
const SB_BG    = '#1c1b1d'
const SB_BDR   = '#434656'
const SB_DIV   = 'rgba(67,70,86,0.6)'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, toggle, close } = useSidebar()
  const { isAdmin, user } = useUser()
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={close}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{ backgroundColor: SB_BG, border: `1px solid ${SB_BDR}` }}
        className={cn(
          'fixed left-3 top-3 bottom-3 z-50 shadow-2xl rounded-2xl',
          'flex flex-col transition-all duration-300',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)]',
          isOpen ? 'md:w-64' : 'md:w-16',
        )}
      >
        {/* Logo row */}
        <div
          style={{ borderBottom: `1px solid ${SB_DIV}` }}
          className={cn(
            'flex items-center transition-all duration-300',
            isOpen ? 'justify-between px-5 py-5' : 'justify-center px-2 py-5',
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* primary-container = #2e5bff */}
            <div className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: '#2e5bff' }}>
              <Zap className="w-4 h-4" style={{ color: '#efefff' }} />
            </div>
            <span className={cn(
              'text-base font-extrabold whitespace-nowrap transition-all duration-200',
              isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden md:block',
            )} style={{ color: '#e5e1e4' }}>
              IT-Fix
            </span>
          </div>

          {/* Mobile close */}
          <button
            onClick={close}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#8e90a2' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pb-4 scrollbar-none">
          {/* Nav links */}
          <nav className="flex-1 px-2 py-4 space-y-0.5">
            {allItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              const isAdminLk = href === '/admin'
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  onClick={() => { if (window.innerWidth < 768) close() }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                    !isOpen && 'md:justify-center md:px-2',
                  )}
                  style={isActive
                    ? isAdminLk
                      ? { backgroundColor: 'rgba(87,27,193,0.2)', color: '#d0bcff', border: '1px solid rgba(208,188,255,0.15)' }
                      : { backgroundColor: 'rgba(46,91,255,0.15)', color: '#b8c3ff', border: '1px solid rgba(184,195,255,0.15)' }
                    : { color: '#8e90a2', border: '1px solid transparent' }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.color = '#c4c5d9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = ''
                      e.currentTarget.style.color = '#8e90a2'
                    }
                  }}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
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

          {/* Bottom actions */}
          <div style={{ borderTop: `1px solid ${SB_DIV}` }} className="px-2 py-2 space-y-0.5">
            {/* Connected as */}
            {isOpen && user && (
              <div className="px-3 py-2 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#434656' }}>Connecté en tant que</p>
                <p className="text-xs font-semibold truncate" style={{ color: '#c4c5d9' }}>{user.email}</p>
              </div>
            )}
            {/* Sign out */}
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-all duration-200',
                !isOpen && 'md:justify-center md:px-2',
              )}
              style={{ color: '#8e90a2', border: '1px solid transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,180,171,0.08)'
                e.currentTarget.style.color = '#ffb4ab'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.color = '#8e90a2'
              }}
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              <span className={cn('whitespace-nowrap transition-all duration-200 overflow-hidden', isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 md:hidden')}>
                Sign Out
              </span>
            </button>

            {/* Desktop collapse */}
            <button
              onClick={toggle}
              title={isOpen ? 'Collapse' : 'Expand'}
              className={cn(
                'hidden md:flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-all duration-200',
                !isOpen && 'md:justify-center md:px-2',
              )}
              style={{ color: '#434656', border: '1px solid transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.color = '#8e90a2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.color = '#434656'
              }}
            >
              {isOpen
                ? <><ChevronLeft className="w-[18px] h-[18px] flex-shrink-0" /><span className="whitespace-nowrap">Collapse</span></>
                : <ChevronRight className="w-[18px] h-[18px] flex-shrink-0" />
              }
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
