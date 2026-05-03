'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Users, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/lib/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import TechnicianCard from '@/components/TechnicianCard'
import EmptyState from '@/components/ui/EmptyState'
import { TechnicianCardSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

type Technician = {
  id: string
  name: string
  email: string
  specialty: string
  available: boolean
  avatar_url: string | null
  created_at: string
}

export default function TechniciansPage() {
  const { isOpen } = useSidebar()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('name')
      if (error) toast.error('Failed to load technicians')
      else setTechnicians(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = technicians.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialty.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#131315' }}>
      <Sidebar />
      <Topbar title="Technicians" />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-72" : "md:ml-20"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 hidden md:block">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8e90a2' }}>User Portal / Team</p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#e5e1e4' }}>Technicians</h1>
            <p className="text-sm mt-1" style={{ color: '#c4c5d9' }}>Access complete profiles, current assignments, and specialized expertise.</p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8e90a2' }} />
            <input
              type="text"
              placeholder="Search technicians..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 shadow-inner"
              style={{ backgroundColor: '#1c1b1d', border: '1px solid rgba(255,255,255,0.06)', color: '#e5e1e4' }}
              onFocus={(e) => { e.target.style.borderColor = '#b8c3ff'; e.target.style.boxShadow = '0 0 0 1px rgba(184,195,255,0.3)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '' }}
            />
          </div>

          {/* Stats counts */}
          {!loading && (
            <div className="flex flex-wrap gap-2.5 mb-6">
              <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8e90a2' }}>
                {technicians.length} Team Members
              </span>
              <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', color: '#4ade80' }}>
                {technicians.filter((t) => t.available).length} Available Now
              </span>
            </div>
          )}

          {/* Technicians grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <TechnicianCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="lg:col-span-2 xl:col-span-3">
                <EmptyState
                  icon={<Users className="w-8 h-8" />}
                  title="No technicians found"
                  description={
                    search
                      ? `No results match "${search}"`
                      : 'Our team list is currently being updated.'
                  }
                />
              </div>
            ) : (
              filtered.map((tech, i) => (
                <div
                  key={tech.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <TechnicianCard technician={tech} />
                </div>
              ))
            )}
          </div>
        </div>
      </main>


    </div>
  )
}
