'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Calendar, AlertCircle, Image as ImageIcon, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import StatusBadge from '@/components/ui/StatusBadge'
import Card from '@/components/ui/Card'
import { PRIORITY_CONFIG, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'

type Ticket = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  image_url: string | null
  technician_id: string | null
  technicians?: { name: string; specialty: string } | null
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, technicians(name, specialty)')
        .eq('id', id)
        .single()
      if (error) {
        toast.error('Ticket not found')
        router.push('/dashboard')
      } else {
        setTicket(data)
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Mobile topbar override */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3 md:hidden">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-base font-semibold text-gray-900 truncate">
          {loading ? 'Loading...' : ticket?.title || 'Ticket'}
        </span>
      </header>

      <main className="md:ml-60 pb-24 md:pb-8">
        <div className="px-4 pt-4 md:px-8 md:pt-8 max-w-2xl">
          {/* Desktop back */}
          <button
            onClick={() => router.back()}
            className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : ticket ? (
            <div className="space-y-4 animate-fade-in">
              {/* Header */}
              <Card>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">{ticket.title}</h1>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY_CONFIG[ticket.priority].color}`}>
                    {PRIORITY_CONFIG[ticket.priority].label} Priority
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(ticket.created_at)}
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-sm font-semibold text-gray-700">Description</h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </Card>

              {/* Technician */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-sm font-semibold text-gray-700">Assigned Technician</h2>
                </div>
                {ticket.technicians ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                      {ticket.technicians.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{ticket.technicians.name}</p>
                      <p className="text-xs text-gray-400">{ticket.technicians.specialty}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No technician assigned yet</p>
                )}
              </Card>

              {/* Screenshot */}
              {ticket.image_url && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    <h2 className="text-sm font-semibold text-gray-700">Screenshot</h2>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    <img
                      src={ticket.image_url}
                      alt="ticket screenshot"
                      className="w-full object-cover max-h-80"
                    />
                  </div>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
