import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    initialized: false,
  }),

  persist: true,

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async initAuth() {
      if (!this.initialized) {
        const { error } = await this.checkSession()
        if (!error) {
          this.initialized = true
        }
      }
    },

    async signUp(email, password, name) {
      try {
        this.loading = true
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name, // Pass name as user metadata
            },
          },
        })

        if (authError) throw authError

        return { user: authData.user, error: null }
      } catch (error) {
        console.error('Error signing up:', error)
        return { user: null, error }
      } finally {
        this.loading = false
      }
    },

    async signIn(email, password) {
      try {
        this.loading = true
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        this.user = data.user
        return { user: data.user, error: null }
      } catch (error) {
        console.error('Error signing in:', error)
        return { user: null, error }
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      try {
        this.loading = true
        const { error } = await supabase.auth.signOut()
        if (error) throw error

        this.user = null
        return { error: null }
      } catch (error) {
        console.error('Error signing out:', error)
        return { error }
      } finally {
        this.loading = false
      }
    },

    async signInWithGoogle() {
      try {
        this.loading = true
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error
        return { data, error: null }
      } catch (error) {
        console.error('Error signing in with Google:', error)
        return { data: null, error }
      } finally {
        this.loading = false
      }
    },

    async checkSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error

        this.user = session?.user || null
        return { user: this.user, error: null }
      } catch (error) {
        console.error('Error checking session:', error)
        return { user: null, error }
      }
    },
  },
})
