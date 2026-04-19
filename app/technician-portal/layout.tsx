'use client'

import React from 'react'
import TechnicianSidebar from '@/components/layout/TechnicianSidebar'
import { SidebarProvider } from '@/lib/context/SidebarContext'

export default function TechnicianPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
