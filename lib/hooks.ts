'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getProfile(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()
      setIsAdmin(data?.is_admin || false)
    }

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        await getProfile(data.user.id)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) getProfile(session.user.id)
      else setIsAdmin(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return { user, isAdmin, loading }
}

export function useTechnician() {
  const [user, setUser] = useState<User | null>(null)
  const [technician, setTechnician] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getTechnicianProfile(email: string) {
      const { data } = await supabase
        .from('technicians')
        .select('*')
        .eq('email', email)
        .single()
      setTechnician(data || null)
    }

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user?.email) {
        await getTechnicianProfile(data.user.email)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.email) getTechnicianProfile(session.user.email)
      else setTechnician(null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return { user, technician, loading }
}
