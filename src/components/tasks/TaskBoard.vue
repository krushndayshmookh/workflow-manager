<template>
  <div class="task-board">
    <div class="row q-col-gutter-md">
      <div v-for="state in states" :key="state.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="state-column">
          <!-- Column Header -->
          <div class="state-header q-px-sm q-py-xs">
            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-chip
                  :style="{ backgroundColor: state.color }"
                  text-color="white"
                  size="sm"
                  class="q-mr-sm"
                >
                  {{ state.name }}
                </q-chip>
                <div class="text-caption text-grey">{{ getTaskCount(state.id) }}</div>
              </div>
              <q-btn flat round dense icon="more_vert">
                <q-menu>
                  <q-list style="min-width: 150px">
                    <q-item clickable v-close-popup @click="createTask(state.id)">
                      <q-item-section>Add Task</q-item-section>
                      <q-item-section avatar>
                        <q-icon name="add" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>

          <!-- Task List -->
          <div class="task-list q-px-sm q-py-md" @dragover.prevent @drop="onDrop($event, state.id)">
            <div
              v-for="task in getTasksByState(state.id)"
              :key="task.id"
              class="task-card q-mb-sm"
              draggable="true"
              @dragstart="onDragStart($event, task)"
            >
              <q-card flat bordered class="cursor-move">
                <q-card-section class="q-pa-sm">
                  <div class="row items-center no-wrap">
                    <div class="col-grow">
                      <div class="text-subtitle2">{{ task.title }}</div>
                    </div>
                    <div class="col-auto">
                      <q-btn flat round dense icon="more_vert">
                        <q-menu>
                          <q-list style="min-width: 150px">
                            <q-item clickable v-close-popup @click="$emit('edit-task', task)">
                              <q-item-section>Edit</q-item-section>
                              <q-item-section avatar>
                                <q-icon name="edit" />
                              </q-item-section>
                            </q-item>
                            <q-separator />
                            <q-item
                              clickable
                              v-close-popup
                              @click="$emit('delete-task', task.id)"
                              class="text-negative"
                            >
                              <q-item-section>Delete</q-item-section>
                              <q-item-section avatar>
                                <q-icon name="delete" />
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                  </div>

                  <div v-if="task.description" class="text-caption text-grey q-mt-xs">
                    {{ task.description }}
                  </div>

                  <div class="row items-center justify-between q-mt-sm">
                    <div class="row items-center q-gutter-x-sm">
                      <q-chip
                        :style="{ backgroundColor: task.priority?.color }"
                        text-color="white"
                        size="sm"
                        dense
                      >
                        {{ task.priority?.name }}
                      </q-chip>
                    </div>
                    <div>
                      <q-avatar size="24px" class="cursor-pointer">
                        <img
                          :src="
                            task.assignee?.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'
                          "
                        />
                        <q-tooltip>{{ task.assignee?.name || 'Unassigned' }}</q-tooltip>
                      </q-avatar>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Empty State -->
            <div
              v-if="!getTasksByState(state.id).length"
              class="text-center text-grey q-py-lg"
              @dragover.prevent
              @drop="onDrop($event, state.id)"
            >
              Drop tasks here
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Task Dialog -->
    <task-form
      v-model="showCreateDialog"
      :states="states"
      :priorities="priorities"
      :members="members"
      :initial-state="selectedStateId"
      @save="onTaskCreate"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from 'stores/task'
import TaskForm from './TaskForm.vue'

const props = defineProps({
  tasks: {
    type: Array,
    required: true,
  },
  states: {
    type: Array,
    required: true,
  },
  priorities: {
    type: Array,
    required: true,
  },
  members: {
    type: Array,
    required: true,
  },
})

// eslint-disable-next-line no-unused-vars
const emit = defineEmits(['update-task', 'delete-task'])

const taskStore = useTaskStore()
const showCreateDialog = ref(false)
const selectedStateId = ref(null)

// Task filtering
function getTasksByState(stateId) {
  return props.tasks.filter((task) => task.state_id === stateId)
}

function getTaskCount(stateId) {
  return getTasksByState(stateId).length
}

// Drag and drop
function onDragStart(event, task) {
  event.dataTransfer.setData('taskId', task.id)
}

async function onDrop(event, stateId) {
  const taskId = event.dataTransfer.getData('taskId')
  if (taskId) {
    await taskStore.updateTaskState(taskId, stateId)
  }
}

// Task creation
function createTask(stateId) {
  selectedStateId.value = stateId
  showCreateDialog.value = true
}

async function onTaskCreate(taskData) {
  try {
    const { error } = await taskStore.createTask({
      ...taskData,
      state_id: selectedStateId.value,
    })
    if (error) throw error

    showCreateDialog.value = false
  } catch (error) {
    console.error('Failed to create task:', error)
  }
}
</script>

<style lang="scss" scoped>
.task-board {
  height: calc(100vh - 200px);
  overflow-x: auto;
}

.state-column {
  height: 100%;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.state-header {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.task-list {
  height: calc(100% - 48px);
  overflow-y: auto;
}

.task-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>
