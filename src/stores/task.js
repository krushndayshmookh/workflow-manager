import { defineStore } from 'pinia'
import { supabase } from 'boot/supabase'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    filters: {
      search: '',
      state: null,
      priority: null,
      assigned_to: null,
      project: null,
    },
    selectedTasks: [],
    states: [
      { id: 1, name: 'To Do', color: 'grey' },
      { id: 2, name: 'In Progress', color: 'blue' },
      { id: 3, name: 'Done', color: 'green' },
      { id: 4, name: 'Archived', color: 'black' },
    ],
    priorities: [
      { id: 1, name: 'Low', color: 'grey' },
      { id: 2, name: 'Medium', color: 'orange' },
      { id: 3, name: 'High', color: 'red' },
      { id: 4, name: 'Critical', color: 'purple' },
    ],
  }),

  getters: {
    filteredTasks: (state) => {
      return state.tasks.filter((task) => {
        const search = state.filters.search.trim().toLowerCase()
        return (
          (search
            ? task.title.toLowerCase().includes(search) ||
              task.description.toLowerCase().includes(search)
            : true) &&
          (state.filters.state ? parseInt(task.state) === parseInt(state.filters.state) : true) &&
          (state.filters.priority
            ? parseInt(task.priority) === parseInt(state.filters.priority)
            : true) &&
          (state.filters.assigned_to ? task.assigned_to === state.filters.assigned_to : true) &&
          (state.filters.project
            ? parseInt(task.project) === parseInt(state.filters.project)
            : true)
        )
      })
    },
  },

  actions: {
    async fetchTasks() {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        this.tasks = data
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        this.loading = false
      }
    },

    async addTask(task) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([
            {
              ...task,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()

        if (error) throw error
        this.tasks.unshift(data[0])
      } catch (error) {
        console.error('Error adding task:', error)
        throw error
      }
    },

    async updateTask(taskId, updates) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId)
          .select()

        if (error) throw error
        const index = this.tasks.findIndex((t) => t.id === taskId)
        if (index !== -1) {
          this.tasks[index] = data[0]
        }
      } catch (error) {
        console.error('Error updating task:', error)
        throw error
      }
    },

    async deleteTask(taskId) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId)
        if (error) throw error
        this.tasks = this.tasks.filter((t) => t.id !== taskId)
      } catch (error) {
        console.error('Error deleting task:', error)
        throw error
      }
    },

    async bulkUpdateTasks(updates) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .in('id', this.selectedTasks)

        if (error) throw error
        await this.fetchTasks()
        this.selectedTasks = []
      } catch (error) {
        console.error('Error bulk updating tasks:', error)
        throw error
      }
    },

    clearFilters() {
      this.filters = {
        search: '',
        state: null,
        priority: null,
        assigned_to: null,
        project: null,
      }
    },
  },
})
