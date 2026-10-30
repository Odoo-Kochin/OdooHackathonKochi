import { createClient } from '@supabase/supabase-js'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') })
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Public Supabase client (respects Row Level Security)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin Supabase client (bypasses RLS - use only for server-side administrative tasks)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null
