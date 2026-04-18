import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

import { SidebarProvider } from '@/lib/context/SidebarContext'
import { ThemeProvider } from '@/lib/context/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IT-Fix — IT Support Ticketing',
  description: 'Modern IT support ticketing platform. Submit, track, and resolve your IT issues effortlessly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300`}>
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              border: '1px solid var(--toast-border)',
              borderRadius: '8px',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#3b82f6', secondary: 'var(--toast-bg)' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'var(--toast-bg)' },
            },
          }}
        />
      </body>
    </html>
  )
}
