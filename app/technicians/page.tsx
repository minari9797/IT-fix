'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Users, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/lib/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
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
    <div className="min-h-screen">
      <Sidebar />
      <Topbar title="Technicians" />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 hidden md:block">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Technicians</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Meet the team handling your tickets</p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm"
            />
          </div>

          {/* Stats counts */}
          {!loading && (
            <div className="flex gap-2.5 mb-6">
              <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest shadow-sm">
                {technicians.length} Team Members
              </span>
              <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 uppercase tracking-widest shadow-sm">
                {technicians.filter((t) => t.available).length} Available Now
              </span>
            </div>
          )}

          {/* Technicians grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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

      <MobileNav />
    </div>
  )
}
