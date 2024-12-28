import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from 'src/stores/auth'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Boot file
export default async () => {
  const authStore = useAuthStore()

  // Set up auth state listener
  supabase.auth.onAuthStateChange((event, session) => {
    authStore.user = session?.user || null
  })

  // Check initial session
  await authStore.checkSession()
}
