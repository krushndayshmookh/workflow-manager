import { defineStore } from 'pinia'
import { supabase } from 'boot/supabase'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [],
    loading: false,
  }),

  getters: {
    projectsWithIcons: (state) => {
      return state.projects.map((project) => ({
        ...project,
        label: `${project.icon} ${project.name}`, // For select components
      }))
    },
  },

  actions: {
    async fetchProjects() {
      this.loading = true
      try {
        const { data, error } = await supabase.from('projects').select('*').order('name')

        if (error) throw error
        this.projects = data
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        this.loading = false
      }
    },

    async addProject(project) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([
            {
              ...project,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()

        if (error) throw error
        this.projects.push(data[0])
        return data[0]
      } catch (error) {
        console.error('Error adding project:', error)
        throw error
      }
    },

    async updateProject(projectId, updates) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId)
          .select()

        if (error) throw error
        const index = this.projects.findIndex((p) => p.id === projectId)
        if (index !== -1) {
          this.projects[index] = data[0]
        }
        return data[0]
      } catch (error) {
        console.error('Error updating project:', error)
        throw error
      }
    },

    async deleteProject(projectId) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', projectId)

        if (error) throw error
        this.projects = this.projects.filter((p) => p.id !== projectId)
      } catch (error) {
        console.error('Error deleting project:', error)
        throw error
      }
    },
  },
})
