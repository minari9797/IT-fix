'use client'

import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async () => {
    // Connexion automatique avec tes identifiants qui possèdent les données [cite: 40, 47]
    const { error } = await supabase.auth.signInWithPassword({
      email: 'user@test.itfix',
      password: 'estin2026'
    })

    if (error) {
      console.error("Erreur de connexion:", error.message)
      alert("Erreur lors de la connexion automatique.")
    } else {
      // Redirection directe vers le dashboard après authentification réussie [cite: 47]
      router.push('/dashboard')
    }
  }

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ backgroundColor: '#131315', color: '#e5e1e4', fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Atmosphères de fond */}
      <div className="pointer-events-none fixed -top-[20%] -left-[10%] w-[700px] h-[700px] rounded-full blur-[150px]"
        style={{ background: 'rgba(46,91,255,0.12)' }} />

      {/* Branding Gauche */}
      <div className="hidden md:flex w-1/2 flex-col justify-between p-14 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2e5bff' }}>
            <Zap className="w-6 h-6" style={{ color: '#efefff' }} />
          </div>
          <span className="text-2xl font-extrabold" style={{ color: '#e5e1e4' }}>IT-Fix</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="font-extrabold leading-tight mb-6" style={{ fontSize: '56px', letterSpacing: '-0.03em' }}>
            IT Support, Simplified.
          </h1>
          <p className="mb-10" style={{ fontSize: '18px', lineHeight: '1.7', color: 'rgba(229,225,228,0.65)', maxWidth: '420px' }}>
            A streamlined ticketing experience designed to keep your workflow uninterrupted and your systems secure.
          </p>
        </div>
        <div className="flex items-center gap-6" style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', color: 'rgba(229,225,228,0.45)' }}>
          <span>AVG. RESPONSE: &lt; 15 MINS</span>
          <span style={{ width: '1px', height: '16px', background: 'rgba(229,225,228,0.2)' }} />
          <span>UPTIME: 99.9%</span>
        </div>
      </div>

      {/* Panneau d'accès Droite */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 relative z-20">
        <div className="w-full max-w-md" style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
        }}>
          <h2 className="font-bold mb-2 text-[28px]">Se connecter</h2>
          <p className="mb-8 text-[14px]" style={{ color: 'rgba(229,225,228,0.5)' }}>Accédez à IT-Fix</p>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 py-4 text-[12px] font-bold uppercase tracking-widest transition-all duration-300"
            style={{
              backgroundColor: '#2e5bff',
              color: '#efefff',
              borderRadius: '0.75rem',
            }}
          >
            Se connecter <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}