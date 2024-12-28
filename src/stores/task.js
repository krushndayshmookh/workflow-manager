import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { useAuthStore } from './auth'
import { useProjectStore } from './project'
import {usePeopleStore} from 'stores/people.js'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
  }),

  persist: true,

  getters: {
    getTasksByState: (state) => (stateId) => {
      return state.tasks.filter((task) => task.state_id === stateId)
    },
    getTasksByPriority: (state) => (priorityId) => {
      return state.tasks.filter((task) => task.priority_id === priorityId)
    },
    getTasksByAssignee: (state) => (personId) => {
      return state.tasks.filter((task) => task.assigned_to === personId)
    },
  },

  actions: {
    async fetchProjectTasks(projectId) {
      try {
        this.loading = true
        const { data, error } = await supabase
          .from('tasks')
          .select(
            `
            *,
            state:task_states(*),
            priority:task_priorities(*),
            assignee:people!tasks_assigned_to_fkey(id, name, avatar_url),
            creator:people!tasks_created_by_fkey(id, name, avatar_url)
          `,
          )
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })

        if (error) throw error
        this.tasks = data
      } catch (error) {
        console.error('Error fetching tasks:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createTask(taskData) {
      try {
        this.loading = true
        const authStore = useAuthStore()
        const projectStore = useProjectStore()
        const peopleStore = usePeopleStore()

        // If no state is specified, use the first state (usually Backlog)
        if (!taskData.state_id && projectStore.taskStates.length > 0) {
          taskData.state_id = projectStore.taskStates[0].id
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert([
            {
              ...taskData,
              created_by: peopleStore.getPeopleByEmail(authStore.user.email).id,
            },
          ])
          .select(
            `
            *,
            state:task_states(*),
            priority:task_priorities(*),
            assignee:people!tasks_assigned_to_fkey(id, name, avatar_url),
            creator:people!tasks_created_by_fkey(id, name, avatar_url)
          `,
          )
          .single()

        if (error) throw error
        this.tasks.unshift(data)
        return { data, error: null }
      } catch (error) {
        console.error('Error creating task:', error)
        return { data: null, error }
      } finally {
        this.loading = false
      }
    },

    async updateTask(taskId, updates) {
      try {
        this.loading = true
        const { data, error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', taskId)
          .select(
            `
            *,
            state:task_states(*),
            priority:task_priorities(*),
            assignee:people!tasks_assigned_to_fkey(id, name, avatar_url),
            creator:people!tasks_created_by_fkey(id, name, avatar_url)
          `,
          )
          .single()

        if (error) throw error

        const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = data
        }

        return { data, error: null }
      } catch (error) {
        console.error('Error updating task:', error)
        return { data: null, error }
      } finally {
        this.loading = false
      }
    },

    async deleteTask(taskId) {
      try {
        this.loading = true
        const { error } = await supabase.from('tasks').delete().eq('id', taskId)

        if (error) throw error
        this.tasks = this.tasks.filter((t) => t.id !== taskId)
        return { error: null }
      } catch (error) {
        console.error('Error deleting task:', error)
        return { error }
      } finally {
        this.loading = false
      }
    },

    async updateTaskState(taskId, stateId) {
      return this.updateTask(taskId, { state_id: stateId })
    },

    async updateTaskPriority(taskId, priorityId) {
      return this.updateTask(taskId, { priority_id: priorityId })
    },

    async assignTask(taskId, personId) {
      return this.updateTask(taskId, { assigned_to: personId })
    },

    async unassignTask(taskId) {
      return this.updateTask(taskId, { assigned_to: null })
    },
  },
})
