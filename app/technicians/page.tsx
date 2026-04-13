'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Users, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import Topbar from '@/components/layout/Topbar'
import TechnicianCard from '@/components/TechnicianCard'
import EmptyState from '@/components/ui/EmptyState'
import { TechnicianCardSkeleton } from '@/components/ui/Skeleton'

type Technician = {
  id: string
  name: string
  specialty: string
  available: boolean
  avatar_url: string | null
  created_at: string
}

export default function TechniciansPage() {
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar title="Technicians" />

      <main className="md:ml-60 pb-24 md:pb-8">
        <div className="px-4 pt-4 md:px-8 md:pt-8 max-w-2xl">
          {/* Header */}
          <div className="mb-5 hidden md:block">
            <h2 className="text-xl font-bold text-gray-900">Technicians</h2>
            <p className="text-sm text-gray-400 mt-0.5">Meet the team handling your tickets</p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            />
          </div>

          {/* Stats chip */}
          {!loading && (
            <div className="flex gap-2 mb-4">
              <span className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-500">
                {technicians.length} technicians
              </span>
              <span className="text-xs px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600">
                {technicians.filter((t) => t.available).length} available
              </span>
            </div>
          )}

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <TechnicianCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Users className="w-7 h-7" />}
                title="No technicians found"
                description={
                  search
                    ? `No results for "${search}"`
                    : 'No technicians have been added yet.'
                }
              />
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
