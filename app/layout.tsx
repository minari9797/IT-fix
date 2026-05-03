import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

import { SidebarProvider } from '@/lib/context/SidebarContext'
import { ThemeProvider } from '@/lib/context/ThemeContext'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-manrope',
})

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
      <body className={`${manrope.className} antialiased`} style={{ backgroundColor: '#131315', color: '#e5e1e4' }}>
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
              background: '#201f22',
              color: '#e5e1e4',
              border: '1px solid #434656',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Manrope, sans-serif',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#b8c3ff', secondary: '#201f22' },
            },
            error: {
              iconTheme: { primary: '#ffb4ab', secondary: '#201f22' },
            },
          }}
        />
      </body>
    </html>
  )
}
