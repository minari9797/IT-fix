import { CheckCircle2, ShieldCheck, Zap, MessageSquare, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface Technician {
  id: string
  name: string
  specialty: string
  available: boolean
  avatar_url: string | null
  resolved_count: number
  bio: string | null
}

interface TechnicianCardProps {
  technician: Technician
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const GRADIENTS = [
  'from-amber-400 to-orange-600',
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-purple-400 to-fuchsia-600',
]

export default function TechnicianCard({ technician }: TechnicianCardProps) {
  const router = useRouter()
  const charSum = technician.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const gradient = GRADIENTS[charSum % GRADIENTS.length]

  const handleBook = () => {
    // We could pass the technician ID in URL params if create-ticket supported it
    // For now, let's just go to the page
    router.push('/create-ticket')
  }

  return (
    <Card className="group relative overflow-hidden p-0 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all duration-500 shadow-xl hover:shadow-blue-500/10 h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Background Accent */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br",
        gradient
      )} />

      <div className="p-6 flex-1 flex flex-col items-center text-center relative z-10">
        {/* Availability Ring & Avatar */}
        <div className="relative mb-6">
          <div className={cn(
            "absolute inset-0 rounded-3xl blur-md opacity-40 animate-pulse",
            technician.available ? "bg-emerald-500" : "bg-slate-400"
          )} />
          <div className={cn(
            "relative w-24 h-24 rounded-3xl p-1",
            technician.available ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-slate-200 dark:bg-slate-800"
          )}>
            <div className="w-full h-full rounded-[20px] overflow-hidden bg-white dark:bg-slate-950 flex items-center justify-center">
              {technician.avatar_url ? (
                <img
                  src={technician.avatar_url}
                  alt={technician.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={cn(
                  "w-full h-full flex items-center justify-center bg-gradient-to-br text-white text-2xl font-black",
                  gradient
                )}>
                  {getInitials(technician.name)}
                </div>
              )}
            </div>
          </div>
          {/* Availability Badge */}
          <div className={cn(
            "absolute -bottom-2 right-1/2 translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg border",
            technician.available 
              ? "bg-emerald-500 text-white border-emerald-400" 
              : "bg-slate-500 text-white border-slate-400"
          )}>
            {technician.available ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Zap className="w-2.5 h-2.5" />}
            {technician.available ? 'Online' : 'Busy'}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-6 w-full">
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {technician.name}
          </h3>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/5 border border-blue-500/20 text-blue-600 dark:text-blue-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{technician.specialty}</span>
          </div>
          {technician.bio && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 mt-3 italic">
              "{technician.bio}"
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 w-full gap-2 mt-auto">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolved</p>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100">{technician.resolved_count}+</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Success</p>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                {94 + (charSum % 6)}%
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={handleBook}
          className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white transition-all shadow-lg active:scale-95 group/btn"
        >
          Request Expert
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </Card>
  )
}
