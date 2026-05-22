'use client'

import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TechnicianLoginPage() {
  const router = useRouter()

  const handleTechLogin = async () => {
    // Connexion automatique pour le compte technicien
    const { error } = await supabase.auth.signInWithPassword({
      email: 'tech@test.itfix',
      password: 'estin2020'
    })

    if (error) {
      console.error("Erreur de connexion technicien:", error.message)
      alert("Erreur lors de la connexion au portail technicien.")
    } else {
      // Redirection vers le dashboard technicien après authentification
      router.push('/technician-portal/dashboard')
    }
  }

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ backgroundColor: '#131315', color: '#e5e1e4', fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Atmospheric glows */}
      <div className="pointer-events-none fixed -top-[20%] -left-[10%] w-[700px] h-[700px] rounded-full blur-[150px]"
        style={{ background: 'rgba(87,27,193,0.12)' }} />
      <div className="pointer-events-none fixed top-[40%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: 'rgba(208,188,255,0.05)' }} />

      {/* LEFT — Branding */}
      <div className="hidden md:flex w-1/2 flex-col justify-between p-14 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#571bc1' }}>
            <ShieldCheck className="w-6 h-6" style={{ color: '#c4abff' }} />
          </div>
          <div>
            <span className="text-2xl font-extrabold" style={{ color: '#e5e1e4' }}>IT-Fix</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d0bcff' }}>Tech Portal</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="font-extrabold leading-tight mb-6" style={{ fontSize: '52px', letterSpacing: '-0.03em' }}>
            Technician Command Center.
          </h1>
          <p style={{ fontSize: '18px', color: '#c4c5d9', lineHeight: '1.6', maxWidth: '24rem' }}>
            Manage, prioritize, and resolve infrastructure issues efficiently.
          </p>
        </div>
      </div>

      {/* RIGHT — Access panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-14 relative z-20">
        <div
          className="w-full max-w-md relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
          }}
        >
          <div className="mb-8">
            <h2 className="font-bold mb-2" style={{ fontSize: '28px', color: '#e5e1e4' }}>Se connecter</h2>
            <p style={{ fontSize: '15px', color: '#c4c5d9' }}>Accès réservé aux techniciens.</p>
          </div>

          <button
            onClick={handleTechLogin}
            className="w-full flex items-center justify-center gap-2 py-4 text-[12px] font-bold uppercase tracking-widest transition-all duration-300"
            style={{
              backgroundColor: '#571bc1',
              color: '#ffffff',
              borderRadius: '0.75rem',
              boxShadow: '0 0 20px rgba(87,27,193,0.25)',
            }}
          >
            Authenticate <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}