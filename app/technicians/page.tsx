'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Users, Search, Rocket, Zap, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/lib/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import MobileNav from '@/components/layout/MobileNav'
import TechnicianCard from '@/components/TechnicianCard'
import EmptyState from '@/components/ui/EmptyState'
import { TechnicianCardSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

type Technician = {
  id: string
  name: string
  specialty: string
  available: boolean
  avatar_url: string | null
  resolved_count: number
  bio: string | null
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

  const totalResolved = technicians.reduce((acc, t) => acc + (t.resolved_count || 0), 0)

  return (
    <div className="min-h-screen uppercase-first bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <Topbar title="Elite Engineering" />
      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-10 md:px-10 md:pt-16 max-w-7xl mx-auto">
          
          {/* Hero Header */}
          <div className="mb-12 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                <Rocket className="w-4 h-4" />
                Elite Support Engineering
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[0.9]">
              Meet Your <span className="text-blue-500">Experts.</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-6 font-medium max-w-2xl leading-relaxed">
              Our engineering team has resolved over <span className="text-slate-900 dark:text-slate-100 font-bold">{totalResolved.toLocaleString()}+</span> technical incidents with a 99.4% satisfaction rate.
            </p>

            {/* Global Stats Strip */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-10">
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{technicians.length}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Experts</span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-emerald-500">{technicians.filter(t => t.available).length}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Online Now</span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">~14m</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg. Response</span>
                </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 sticky top-4 z-20 backdrop-blur-md bg-slate-50/50 dark:bg-slate-950/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search by name, specialty or tech stack..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-transparent bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                 <Zap className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">System Operational</span>
            </div>
          </div>

          {/* Technicians grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <TechnicianCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="lg:col-span-Full xl:col-span-Full">
                <EmptyState
                  icon={<Users className="w-8 h-8" />}
                  title="No Experts Found"
                  description={
                    search
                      ? `We couldn't find any specialist matching "${search}".`
                      : 'Our expert directory is currently being synchronized.'
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
