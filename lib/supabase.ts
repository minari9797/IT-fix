import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Please add them to your .env.local file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      tickets: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          status: 'pending' | 'in_progress' | 'resolved'
          user_id: string
          technician_id: string | null
          image_url: string | null
          priority: 'low' | 'medium' | 'high'
        }
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>
      }
      technicians: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          specialty: string
          avatar_url: string | null
          available: boolean
        }
        Insert: Omit<Database['public']['Tables']['technicians']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['technicians']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
    }
  }
}
