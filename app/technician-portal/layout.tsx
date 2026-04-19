'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import TechnicianSidebar from '@/components/layout/TechnicianSidebar'
import { SidebarProvider } from '@/lib/context/SidebarContext'

export default function TechnicianPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Use a more robust check to detect the login page
  const isLoginPage = !pathname || pathname.startsWith('/technician-portal/login')

  if (isLoginPage) {
    return (
      <SidebarProvider>
        {children}
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <TechnicianSidebar />
        <div className="flex-1 min-h-screen">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
