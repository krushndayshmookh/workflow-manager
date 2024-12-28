import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { useAuthStore } from './auth'

export const usePeopleStore = defineStore('people', {
  state: () => ({
    people: [],
    loading: false,
    error: null,
  }),

  persist: true,

  getters: {
    getPeopleByRole: (state) => (role) => {
      return state.people.filter((person) => person.role === role)
    },
    getPeopleByEmail: (state) => (email) => {
      return state.people.find((person) => person.email === email)
    },
  },

  actions: {
    async fetchPeople() {
      try {
        this.loading = true
        const { data, error } = await supabase.from('people').select('*').order('name')

        if (error) throw error
        this.people = data
      } catch (error) {
        console.error('Error fetching people:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createPerson(personData) {
      try {
        this.loading = true
        const authStore = useAuthStore()
        const { data, error } = await supabase.from('people').insert([
          {
            id: authStore.user.id,
            email: personData.email,
            name: personData.name,
            role: personData.role || 'member',
            avatar_url: personData.avatar_url,
          },
        ])

        if (error) throw error
        await this.fetchPeople()
        return { data, error: null }
      } catch (error) {
        console.error('Error creating person:', error)
        return { data: null, error }
      } finally {
        this.loading = false
      }
    },

    async updatePerson(id, updates) {
      try {
        this.loading = true
        const { data, error } = await supabase.from('people').update(updates).match({ id })

        if (error) throw error
        await this.fetchPeople()
        return { data, error: null }
      } catch (error) {
        console.error('Error updating person:', error)
        return { data: null, error }
      } finally {
        this.loading = false
      }
    },

    getCurrentUser() {
      try {
        const authStore = useAuthStore()
        if (!authStore.user) return null

        const email = authStore.user.email
        const user = this.getPeopleByEmail(email)

        return user
      } catch (error) {
        console.error('Error fetching current user:', error)
        return null
      }
    },
  },
})
