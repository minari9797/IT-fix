'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import TechnicianSidebar from '@/components/layout/TechnicianSidebar'

export default function TechnicianPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const isLoginPage = !pathname || pathname.startsWith('/technician-portal/login')

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex">
      <TechnicianSidebar />
      <div className="flex-1 min-h-screen">
        {children}
      </div>
    </div>
  )
}

