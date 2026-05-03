'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Search, ClipboardList, ShieldCheck,
  LogOut, X, ChevronLeft, ChevronRight, Sun, Moon, Power
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/lib/context/SidebarContext'
import { useTheme } from '@/lib/context/ThemeContext'
import { useTechnician } from '@/lib/hooks'
import toast from 'react-hot-toast'

const techNavItems = [
  { href: '/technician-portal/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/technician-portal/my-tickets', label: 'My Tickets', icon: ClipboardList },
  { href: '/technician-portal/pool', label: 'Open Pool', icon: Search },
]

// Tech sidebar uses secondary (purple) tokens
// secondary-container: #571bc1 | secondary: #d0bcff | surface-low: #1c1b1d
const SB_BG  = '#1c1b1d'
const SB_BDR = '#434656'
const SB_DIV = 'rgba(67,70,86,0.6)'

export default function TechnicianSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, toggle, close } = useSidebar()
  const { theme, toggleTheme } = useTheme()
  const { technician } = useTechnician()

  const [available, setAvailable] = useState<boolean>(true)
  const [togglingAvail, setTogglingAvail] = useState(false)

  useEffect(() => {
    if (technician) setAvailable(technician.available)
  }, [technician])

  const toggleAvailability = async () => {
    if (!technician || togglingAvail) return
    setTogglingAvail(true)
    const next = !available
    setAvailable(next)
    const { error } = await supabase
      .from('technicians')
      .update({ available: next })
      .eq('id', technician.id)
    if (error) {
      setAvailable(!next)
      toast.error('Could not update availability')
    } else {
      toast.success(next ? 'You are now Online' : 'You are now Offline')
    }
    setTogglingAvail(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/technician-portal/login')
  }

  const mkBtn = (handler: () => void, title: string, icon: React.ReactNode, label: string, extraStyle?: React.CSSProperties) => (
    <button
      onClick={handler}
      title={title}
      className={cn('flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-all duration-200', !isOpen && 'md:justify-center md:px-2')}
      style={{ color: '#8e90a2', border: '1px solid transparent', ...extraStyle }}
      onMouseEnter={(e) => { if (!extraStyle?.color || extraStyle.color === '#8e90a2') { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#c4c5d9' } }}
      onMouseLeave={(e) => { if (!extraStyle?.color || extraStyle.color === '#8e90a2') { (e.currentTarget as HTMLElement).style.backgroundColor = ''; (e.currentTarget as HTMLElement).style.color = '#8e90a2' } }}
    >
      {icon}
      <span className={cn('whitespace-nowrap transition-all duration-200 overflow-hidden', isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 md:hidden')}>
        {label}
      </span>
    </button>
  )

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={close} />
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
        {/* Logo */}
        <div
          style={{ borderBottom: `1px solid ${SB_DIV}` }}
          className={cn('flex items-center transition-all duration-300', isOpen ? 'justify-between px-5 py-5' : 'justify-center px-2 py-5')}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* secondary-container = #571bc1 */}
            <div className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#571bc1' }}>
              <ShieldCheck className="w-4 h-4" style={{ color: '#c4abff' }} />
            </div>
            <div className={cn('flex flex-col transition-all duration-200 overflow-hidden', isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden md:block')}>
              <span className="text-base font-extrabold whitespace-nowrap leading-none" style={{ color: '#e5e1e4' }}>IT-Fix</span>
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5" style={{ color: '#d0bcff' }}>Tech Portal</span>
            </div>
          </div>
          <button onClick={close} className="md:hidden p-2 rounded-lg" style={{ color: '#8e90a2' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pb-4 scrollbar-none">
          {/* Nav */}
          <nav className="flex-1 px-2 py-4 space-y-0.5">
            {techNavItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  onClick={() => { if (window.innerWidth < 768) close() }}
                  className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200', !isOpen && 'md:justify-center md:px-2')}
                  style={isActive
                    ? { backgroundColor: 'rgba(87,27,193,0.2)', color: '#d0bcff', border: '1px solid rgba(208,188,255,0.15)' }
                    : { color: '#8e90a2', border: '1px solid transparent' }
                  }
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#c4c5d9' } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#8e90a2' } }}
                >
                  <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                  <span className={cn('whitespace-nowrap transition-all duration-200 overflow-hidden', isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 md:hidden')}>
                    {label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom actions */}
          <div style={{ borderTop: `1px solid ${SB_DIV}` }} className="px-2 py-2 space-y-0.5">
            {/* Connected as */}
            {isOpen && technician && (
              <div className="px-3 py-2 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#434656' }}>Connecté en tant que</p>
                <p className="text-xs font-semibold truncate" style={{ color: '#c4c5d9' }}>{technician.name}</p>
                <p className="text-[10px] truncate" style={{ color: '#434656' }}>{technician.email}</p>
              </div>
            )}
            {/* Availability */}
            <button
              onClick={toggleAvailability}
              disabled={togglingAvail}
              title={available ? 'Go Offline' : 'Go Online'}
              className={cn('flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50', !isOpen && 'md:justify-center md:px-2')}
              style={available
                ? { color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', backgroundColor: 'rgba(74,222,128,0.06)' }
                : { color: '#8e90a2', border: '1px solid transparent' }
              }
            >
              <Power style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span className={cn('whitespace-nowrap transition-all duration-200 overflow-hidden', isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 md:hidden')}>
                {available ? 'Online' : 'Offline'}
              </span>
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className={cn('flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-all duration-200', !isOpen && 'md:justify-center md:px-2')}
              style={{ color: '#8e90a2', border: '1px solid transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,180,171,0.08)'; e.currentTarget.style.color = '#ffb4ab' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#8e90a2' }}
            >
              <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span className={cn('whitespace-nowrap transition-all duration-200 overflow-hidden', isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 md:hidden')}>
                Sign Out
              </span>
            </button>

            {/* Collapse */}
            <button
              onClick={toggle}
              title={isOpen ? 'Collapse' : 'Expand'}
              className={cn('hidden md:flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-all duration-200', !isOpen && 'md:justify-center md:px-2')}
              style={{ color: '#434656', border: '1px solid transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8e90a2' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#434656' }}
            >
              {isOpen
                ? <><ChevronLeft style={{ width: 18, height: 18, flexShrink: 0 }} /><span className="whitespace-nowrap">Collapse</span></>
                : <ChevronRight style={{ width: 18, height: 18, flexShrink: 0 }} />
              }
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
