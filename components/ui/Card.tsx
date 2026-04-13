'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  className?: string
  children: ReactNode
  onClick?: () => void
  hover?: boolean
}

export default function Card({ className, children, onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm p-4',
        hover && 'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-emerald-100 hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
