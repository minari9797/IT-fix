'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Settings, 
  Power,
  Zap,
  LogOut,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useTechnician } from '@/lib/hooks'
import { useSidebar } from '@/lib/context/SidebarContext'
import TechnicianTopbar from '@/components/layout/TechnicianTopbar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function TechnicianProfilePage() {
  const { technician, loading: authLoading } = useTechnician()
  const router = useRouter()
  const { isOpen } = useSidebar()
  
  const [localTechnician, setLocalTechnician] = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!authLoading && !technician) router.push('/technician-portal/login')
    if (technician) setLocalTechnician(technician)
  }, [technician, authLoading, router])

  const toggleAvailability = async () => {
    if (!localTechnician) return
    setUpdating(true)
    
    const newStatus = !localTechnician.available

    const { error } = await supabase
      .from('technicians')
      .update({ available: newStatus })
      .eq('id', localTechnician.id)

    if (error) {
       console.error('Update error:', error)
       toast.error(`Error: ${error.message}`)
    } else {
       toast.success(`You are now ${newStatus ? 'online' : 'offline'}`)
       setLocalTechnician({ ...localTechnician, available: newStatus })
    }
    setUpdating(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/technician-portal/login')
  }

  if (authLoading || !localTechnician) return null

  return (
    <div className="min-h-screen uppercase-first">
      <TechnicianTopbar title="Profile" />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-4 md:px-8 md:pt-10 max-w-lg mx-auto w-full space-y-6">
          
          {/* Header */}
          <div className="text-center mb-4">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center justify-center gap-2">
                <Settings className="w-6 h-6 text-amber-500" />
                Technician Settings
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Management Console</p>
          </div>

          {/* Profile Card */}
          <Card className="p-8 border-amber-500/10 shadow-2xl shadow-amber-900/10">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                {localTechnician.avatar_url ? (
                  <img
                    src={localTechnician.avatar_url}
                    alt={localTechnician.name}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-900/30">
                    <User className="w-10 h-10" />
                  </div>
                )}
                <div className={cn(
                    "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shadow-md",
                    localTechnician.available ? "bg-emerald-500" : "bg-slate-400"
                )} />
              </div>
              
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{localTechnician.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">
                    Senior {localTechnician.specialty}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
               <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{localTechnician.email}</p>
                     </div>
                  </div>
               </div>

               {/* Availability Toggle */}
               <button 
                onClick={toggleAvailability}
                disabled={updating}
                className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98]",
                    localTechnician.available 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                        : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500"
                )}
               >
                  <div className="flex items-center gap-3">
                     <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm transition-colors",
                        localTechnician.available ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                     )}>
                        <Power className="w-4 h-4" />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Availability</p>
                        <p className="text-sm font-bold">{localTechnician.available ? 'Accepting Tickets' : 'Offline / Busy'}</p>
                     </div>
                  </div>
                  <div className={cn(
                    "w-10 h-6 rounded-full relative transition-colors",
                    localTechnician.available ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  )}>
                    <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                        localTechnician.available ? "right-1" : "left-1"
                    )} />
                  </div>
               </button>
            </div>
          </Card>

          {/* Stats Glance */}
          <div className="grid grid-cols-2 gap-4">
             <Card className="text-center py-6">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">84</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Resolved</p>
             </Card>
             <Card className="text-center py-6">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Power className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">4.9/5</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Satisfaction</p>
             </Card>
          </div>

          <Button
            variant="danger"
            fullWidth
            size="lg"
            loading={signingOut}
            onClick={handleSignOut}
            className="shadow-xl shadow-red-900/20 py-4"
          >
            <LogOut className="w-4 h-4" />
            Sign Out from System
          </Button>

        </div>
      </main>
    </div>
  )
}
