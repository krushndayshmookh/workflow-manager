<template>
  <q-page>
    <!-- Project Header -->
    <div class="project-header q-px-md q-py-sm">
      <div class="row items-center">
        <div class="col-grow">
          <div class="row items-center">
            <q-icon
              :name="currentProject?.icon || 'folder'"
              :style="{ color: currentProject?.color || 'inherit' }"
              size="28px"
              class="q-mr-sm"
            />
            <div class="text-h5">{{ currentProject?.name }}</div>
          </div>
        </div>
        <div class="col-auto">
          <q-btn-group flat>
            <q-btn
              flat
              :icon="viewMode === 'list' ? 'view_list' : 'view_column'"
              @click="toggleViewMode"
            >
              <q-tooltip>Toggle view</q-tooltip>
            </q-btn>
            <q-btn flat icon="filter_list" @click="showFilters = !showFilters">
              <q-tooltip>Show filters</q-tooltip>
            </q-btn>
            <q-btn flat icon="group_add" @click="showInviteDialog = true">
              <q-tooltip>Invite members</q-tooltip>
            </q-btn>
            <q-btn flat icon="settings" @click="openSettings" v-if="projectStore.isProjectAdmin">
              <q-tooltip>Project settings</q-tooltip>
            </q-btn>
          </q-btn-group>
        </div>
      </div>

      <!-- Filters Panel -->
      <q-slide-transition>
        <div v-show="showFilters" class="q-mt-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.search"
                dense
                outlined
                placeholder="Search tasks..."
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.state"
                :options="projectStore.taskStates"
                option-label="name"
                option-value="id"
                dense
                outlined
                clearable
                emit-value
                map-options
                label="State"
              >
                <!-- eslint-disable-next-line vue/no-unused-vars -->
                <template v-slot:option="{ itemProps, opt, selected }">
                  <q-item v-bind="itemProps">
                    <q-item-section>
                      <q-chip
                        :style="{ backgroundColor: opt.color }"
                        text-color="white"
                        size="sm"
                        class="q-mr-sm"
                      >
                        {{ opt.name }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.priority"
                :options="projectStore.taskPriorities"
                option-label="name"
                option-value="id"
                dense
                outlined
                clearable
                emit-value
                map-options
                label="Priority"
              >
                <!-- eslint-disable-next-line vue/no-unused-vars -->
                <template v-slot:option="{ itemProps, opt, selected }">
                  <q-item v-bind="itemProps">
                    <q-item-section>
                      <q-chip
                        :style="{ backgroundColor: opt.color }"
                        text-color="white"
                        size="sm"
                        class="q-mr-sm"
                      >
                        {{ opt.name }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.assignee"
                :options="projectStore.members"
                option-label="person.name"
                option-value="person.id"
                dense
                outlined
                clearable
                emit-value
                map-options
                label="Assignee"
              >
                <!-- eslint-disable-next-line vue/no-unused-vars -->
                <template v-slot:option="{ itemProps, opt, selected }">
                  <q-item v-bind="itemProps">
                    <q-item-section avatar>
                      <q-avatar size="24px">
                        <img
                          :src="
                            opt.person.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'
                          "
                        />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      {{ opt.person.name }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>
        </div>
      </q-slide-transition>
    </div>

    <q-separator />

    <!-- Task List/Board -->
    <div class="q-pa-md">
      <template v-if="!taskStore.loading">
        <!-- List View -->
        <task-list
          v-if="viewMode === 'list'"
          :tasks="filteredTasks"
          :states="projectStore.taskStates"
          :priorities="projectStore.taskPriorities"
          :members="projectStore.members"
          @update-task="updateTask"
          @delete-task="deleteTask"
        />

        <!-- Board View -->
        <task-board
          v-else
          :tasks="filteredTasks"
          :states="projectStore.taskStates"
          :priorities="projectStore.taskPriorities"
          :members="projectStore.members"
          @update-task="updateTask"
          @delete-task="deleteTask"
        />

        <!-- Empty State -->
        <div v-if="filteredTasks.length === 0" class="text-center q-pa-xl">
          <div class="text-h6 text-grey q-mb-md">No tasks found</div>
          <q-btn
            color="primary"
            icon="add"
            label="Create Task"
            @click="showCreateTaskDialog = true"
          />
        </div>
      </template>

      <!-- Loading State -->
      <div v-else class="row q-col-gutter-md">
        <div v-for="n in 5" :key="n" class="col-12">
          <q-card>
            <q-card-section>
              <q-skeleton type="text" class="text-subtitle1" />
              <q-skeleton type="text" class="text-caption" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-btn fab icon="add" color="primary" @click="showCreateTaskDialog = true" />
    </q-page-sticky>

    <!-- Create Task Dialog -->
    <task-form
      v-model="showCreateTaskDialog"
      :states="projectStore.taskStates"
      :priorities="projectStore.taskPriorities"
      :members="projectStore.members"
      @save="createTask"
    />

    <!-- Invite Member Dialog -->
    <q-dialog v-model="showInviteDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Invite Member</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="inviteMember" class="q-gutter-md">
            <q-input
              v-model="inviteForm.email"
              type="email"
              label="Email"
              outlined
              :rules="[
                (val) => !!val || 'Email is required',
                (val) => validateEmail(val) || 'Invalid email',
              ]"
            />

            <q-select
              v-model="inviteForm.role"
              :options="[
                { label: 'Admin', value: 'admin' },
                { label: 'Member', value: 'member' },
              ]"
              label="Role"
              outlined
              emit-value
              map-options
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" color="negative" flat v-close-popup />
              <q-btn label="Invite" type="submit" color="primary" :loading="projectStore.loading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from 'stores/project'
import { useTaskStore } from 'stores/task'
import { useQuasar } from 'quasar'
import TaskList from 'components/tasks/TaskList.vue'
import TaskBoard from 'components/tasks/TaskBoard.vue'
import TaskForm from 'components/tasks/TaskForm.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const viewMode = ref('list')
const showFilters = ref(false)
const showCreateTaskDialog = ref(false)
const showInviteDialog = ref(false)

const filters = ref({
  search: '',
  state: null,
  priority: null,
  assignee: null,
})

const inviteForm = ref({
  email: '',
  role: 'member',
})

const currentProject = computed(() => projectStore.currentProject)

const filteredTasks = computed(() => {
  let tasks = [...taskStore.tasks]

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search),
    )
  }

  if (filters.value.state) {
    tasks = tasks.filter((task) => task.state_id === filters.value.state)
  }

  if (filters.value.priority) {
    tasks = tasks.filter((task) => task.priority_id === filters.value.priority)
  }

  if (filters.value.assignee) {
    tasks = tasks.filter((task) => task.assigned_to === filters.value.assignee)
  }

  return tasks
})

function toggleViewMode() {
  viewMode.value = viewMode.value === 'list' ? 'board' : 'list'
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function createTask(taskData) {
  try {
    const { error } = await taskStore.createTask({
      ...taskData,
      project_id: currentProject.value.id,
    })
    if (error) throw error

    showCreateTaskDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Task created successfully',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to create task',
    })
  }
}

async function updateTask(taskId, updates) {
  try {
    const { error } = await taskStore.updateTask(taskId, updates)
    if (error) throw error
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to update task',
    })
  }
}

async function deleteTask(taskId) {
  try {
    const confirm = await $q.dialog({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this task?',
      cancel: true,
      persistent: true,
    })

    if (confirm) {
      const { error } = await taskStore.deleteTask(taskId)
      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Task deleted successfully',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to delete task',
    })
  }
}

async function inviteMember() {
  try {
    const { error } = await projectStore.inviteMember(
      currentProject.value.id,
      inviteForm.value.email,
      inviteForm.value.role,
    )
    if (error) throw error

    showInviteDialog.value = false
    inviteForm.value = {
      email: '',
      role: 'member',
    }

    $q.notify({
      type: 'positive',
      message: 'Member invited successfully',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to invite member',
    })
  }
}

function openSettings() {
  router.push(`/projects/${currentProject.value.id}/settings`)
}

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await projectStore.setCurrentProject(newId)
      await taskStore.fetchProjectTasks(newId)
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.project-header {
  background: linear-gradient(to right, rgba(25, 118, 210, 0.05), transparent);
}
</style>
