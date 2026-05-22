'use client'

import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

export default function TechnicianLoginPage() {
  const router = useRouter()

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ backgroundColor: '#131315', color: '#e5e1e4', fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Atmospheric glows — purple for tech portal */}
      <div className="pointer-events-none fixed -top-[20%] -left-[10%] w-[700px] h-[700px] rounded-full blur-[150px]"
           style={{ background: 'rgba(87,27,193,0.12)' }} />
      <div className="pointer-events-none fixed top-[40%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[120px]"
           style={{ background: 'rgba(208,188,255,0.05)' }} />

      {/* LEFT — Branding */}
      <div className="hidden md:flex w-1/2 flex-col justify-between p-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#571bc1' }}>
            <ShieldCheck className="w-6 h-6" style={{ color: '#c4abff' }} />
          </div>
          <div>
            <span className="text-2xl font-extrabold" style={{ color: '#e5e1e4' }}>IT-Fix</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d0bcff' }}>Tech Portal</span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="font-extrabold leading-tight mb-6" style={{ fontSize: '52px', letterSpacing: '-0.03em', color: '#e5e1e4' }}>
            Technician{'\n'}Command Center.
          </h1>
          <p style={{ fontSize: '18px', color: '#c4c5d9', lineHeight: '1.6', maxWidth: '24rem' }}>
            Manage, prioritize, and resolve infrastructure issues efficiently. Built for technicians, by technicians.
          </p>
        </div>

        {/* Footer stats */}
        <div className="flex items-center gap-6 text-[12px] font-bold uppercase tracking-widest" style={{ color: '#8e90a2' }}>
          <span>Restricted Access</span>
          <span style={{ width: 1, height: 16, backgroundColor: '#434656', display: 'inline-block' }} />
          <span>Tech-only Portal</span>
        </div>
      </div>

      {/* RIGHT — Access panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-14 relative z-20">
        <div
          className="w-full max-w-md relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
          }}
        >
          {/* Inner glow — purple tint */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 rounded-full -z-10"
               style={{ background: 'rgba(87,27,193,0.1)', filter: 'blur(40px)' }} />

          <div className="mb-8">
            <h2 className="font-bold mb-2" style={{ fontSize: '28px', letterSpacing: '-0.01em', color: '#e5e1e4' }}>Se connecter</h2>
            <p style={{ fontSize: '15px', color: '#c4c5d9' }}>Accédez au portail technicien.</p>
          </div>

          {/* Single access button — purple */}
          <button
            onClick={() => router.push('/technician-portal/dashboard')}
            className="w-full flex items-center justify-center gap-2 py-4 text-[12px] font-bold uppercase tracking-widest transition-all duration-300 active:scale-[0.98] mt-3"
            style={{
              backgroundColor: '#571bc1',
              color: '#c4abff',
              borderRadius: '0.75rem',
              boxShadow: '0 0 20px rgba(87,27,193,0.25)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e9ddff'; e.currentTarget.style.color = '#3c0091'; e.currentTarget.style.boxShadow = '0 0 30px rgba(87,27,193,0.45)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#571bc1'; e.currentTarget.style.color = '#c4abff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(87,27,193,0.25)' }}
          >
            Authenticate <span>→</span>
          </button>

          {/* Footer */}
          <div className="mt-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#434656' }}>
              IT-Fix Infrastructure © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
