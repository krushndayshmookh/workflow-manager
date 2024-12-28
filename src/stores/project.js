import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'

export const useProjectStore = defineStore('project', {
  state: () => ({
    loading: false,
    projects: [],
    currentProject: null,
    members: [],
    taskStates: [],
    taskPriorities: [],
    allTasks: [],
  }),

  getters: {
    isProjectAdmin: (state) => {
      if (!state.currentProject) return false
      const member = state.members.find(
        (m) => m.person_id === supabase.auth.getUser()?.data?.user?.id,
      )
      return member?.role === 'admin'
    },
  },

  actions: {
    async fetchUserProjects() {
      try {
        this.loading = true
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const { data: memberships, error: membershipError } = await supabase
          .from('project_memberships')
          .select('project_id')
          .eq('person_id', user.id)

        if (membershipError) throw membershipError

        const projectIds = memberships.map((m) => m.project_id)
        const { data: projects, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds)

        if (projectError) throw projectError
        this.projects = projects
      } catch (error) {
        console.error('Error fetching projects:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async setCurrentProject(projectId) {
      try {
        this.loading = true
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        if (projectError) throw projectError
        this.currentProject = project

        // Fetch project members
        const { data: members, error: membersError } = await supabase
          .from('project_memberships')
          .select('*, person:people(*)')
          .eq('project_id', projectId)

        if (membersError) throw membersError
        this.members = members

        // Fetch task states
        const { data: states, error: statesError } = await supabase
          .from('task_states')
          .select('*')
          .eq('project_id', projectId)
          .order('position')

        if (statesError) throw statesError
        this.taskStates = states

        // Fetch task priorities
        const { data: priorities, error: prioritiesError } = await supabase
          .from('task_priorities')
          .select('*')
          .eq('project_id', projectId)
          .order('position')

        if (prioritiesError) throw prioritiesError
        this.taskPriorities = priorities
      } catch (error) {
        console.error('Error setting current project:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createProject(projectData) {
      try {
        this.loading = true
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single()

        if (projectError) throw projectError

        // Add creator as admin
        const { error: membershipError } = await supabase.from('project_memberships').insert([
          {
            project_id: project.id,
            person_id: user.id,
            role: 'admin',
          },
        ])

        if (membershipError) throw membershipError

        // Create default states
        const defaultStates = [
          { name: 'Backlog', color: '#718096', position: 0 },
          { name: 'Todo', color: '#3182CE', position: 1 },
          { name: 'In Progress', color: '#805AD5', position: 2 },
          { name: 'Done', color: '#38A169', position: 3 },
        ]

        const { error: statesError } = await supabase.from('task_states').insert(
          defaultStates.map((state) => ({
            ...state,
            project_id: project.id,
          })),
        )

        if (statesError) throw statesError

        // Create default priorities
        const defaultPriorities = [
          { name: 'Low', color: '#718096', position: 0 },
          { name: 'Medium', color: '#3182CE', position: 1 },
          { name: 'High', color: '#805AD5', position: 2 },
          { name: 'Urgent', color: '#E53E3E', position: 3 },
        ]

        const { error: prioritiesError } = await supabase.from('task_priorities').insert(
          defaultPriorities.map((priority) => ({
            ...priority,
            project_id: project.id,
          })),
        )

        if (prioritiesError) throw prioritiesError

        await this.fetchUserProjects()
        return { project }
      } catch (error) {
        console.error('Error creating project:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProject(projectId, updates) {
      try {
        const { error } = await supabase.from('projects').update(updates).eq('id', projectId)

        if (error) throw error
        await this.setCurrentProject(projectId)
      } catch (error) {
        console.error('Error updating project:', error)
        throw error
      }
    },

    async deleteProject(projectId) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', projectId)

        if (error) throw error
        await this.fetchUserProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
        throw error
      }
    },

    async inviteMember(projectId, email, role) {
      try {
        // First, check if the person exists
        const { data: person, error: personError } = await supabase
          .from('people')
          .select('id')
          .eq('email', email)
          .single()

        if (personError) throw personError

        // Add project membership
        const { error: membershipError } = await supabase.from('project_memberships').insert([
          {
            project_id: projectId,
            person_id: person.id,
            role,
          },
        ])

        if (membershipError) throw membershipError

        await this.setCurrentProject(projectId)
      } catch (error) {
        console.error('Error inviting member:', error)
        throw error
      }
    },

    async updateMemberRole(projectId, personId, role) {
      try {
        const { error } = await supabase
          .from('project_memberships')
          .update({ role })
          .eq('project_id', projectId)
          .eq('person_id', personId)

        if (error) throw error
        await this.setCurrentProject(projectId)
      } catch (error) {
        console.error('Error updating member role:', error)
        throw error
      }
    },

    async removeMember(projectId, personId) {
      try {
        const { error } = await supabase
          .from('project_memberships')
          .delete()
          .eq('project_id', projectId)
          .eq('person_id', personId)

        if (error) throw error
        await this.setCurrentProject(projectId)
      } catch (error) {
        console.error('Error removing member:', error)
        throw error
      }
    },

    async createTaskState(stateData) {
      try {
        const { error } = await supabase.from('task_states').insert([stateData])

        if (error) throw error
        await this.setCurrentProject(stateData.project_id)
      } catch (error) {
        console.error('Error creating task state:', error)
        throw error
      }
    },

    async updateTaskState(stateId, updates) {
      try {
        const { error } = await supabase.from('task_states').update(updates).eq('id', stateId)

        if (error) throw error
        await this.setCurrentProject(this.currentProject.id)
      } catch (error) {
        console.error('Error updating task state:', error)
        throw error
      }
    },

    async deleteTaskState(stateId) {
      try {
        const { error } = await supabase.from('task_states').delete().eq('id', stateId)

        if (error) throw error
        await this.setCurrentProject(this.currentProject.id)
      } catch (error) {
        console.error('Error deleting task state:', error)
        throw error
      }
    },

    async createTaskPriority(priorityData) {
      try {
        const { error } = await supabase.from('task_priorities').insert([priorityData])

        if (error) throw error
        await this.setCurrentProject(priorityData.project_id)
      } catch (error) {
        console.error('Error creating task priority:', error)
        throw error
      }
    },

    async updateTaskPriority(priorityId, updates) {
      try {
        const { error } = await supabase
          .from('task_priorities')
          .update(updates)
          .eq('id', priorityId)

        if (error) throw error
        await this.setCurrentProject(this.currentProject.id)
      } catch (error) {
        console.error('Error updating task priority:', error)
        throw error
      }
    },

    async deleteTaskPriority(priorityId) {
      try {
        const { error } = await supabase.from('task_priorities').delete().eq('id', priorityId)

        if (error) throw error
        await this.setCurrentProject(this.currentProject.id)
      } catch (error) {
        console.error('Error deleting task priority:', error)
        throw error
      }
    },

    async fetchAllTasks() {
      try {
        this.loading = true
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select(
            `
            *,
            project:projects(id, name),
            state:task_states(id, name, color),
            priority:task_priorities(id, name, color),
            assignee:people!tasks_assigned_to_fkey(id, name, avatar_url),
            creator:people!tasks_created_by_fkey(id, name, avatar_url)
          `,
          )
          .order('created_at', { ascending: false })

        if (error) throw error
        this.allTasks = tasks
      } catch (error) {
        console.error('Error fetching tasks:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
