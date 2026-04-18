import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'

import { SidebarProvider } from '@/lib/context/SidebarContext'

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
<<<<<<< Updated upstream
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased selection:bg-blue-500/30 selection:text-blue-200`}>
        <SidebarProvider>
          {children}
        </SidebarProvider>
=======
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-switcher"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          ` }}
        />
      </head>
      <body className={`${inter.className} text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300`} suppressHydrationWarning>
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
>>>>>>> Stashed changes
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              background: '#1e293b', // slate-800
              color: '#f1f5f9', // slate-100
              fontSize: '14px',
              padding: '12px 16px',
              border: '1px solid #334155', // slate-700
            },
            success: {
              iconTheme: { primary: '#3b82f6', secondary: '#f1f5f9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
            },
          }}
        />
      </body>
    </html>
  )
}
