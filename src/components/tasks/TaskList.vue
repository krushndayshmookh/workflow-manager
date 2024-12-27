<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Search and Filters -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="taskStore.filters.search"
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
              <div class="col-12 col-md-8">
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-4">
                    <q-select
                      v-model="taskStore.filters.state"
                      :options="taskStore.states"
                      option-label="name"
                      option-value="id"
                      dense
                      outlined
                      clearable
                      emit-value
                      map-options
                      label="State"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-select
                      v-model="taskStore.filters.priority"
                      :options="taskStore.priorities"
                      option-label="name"
                      option-value="id"
                      dense
                      outlined
                      clearable
                      emit-value
                      map-options
                      label="Priority"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-select
                      v-model="taskStore.filters.assigned_to"
                      :options="people"
                      option-label="name"
                      option-value="email"
                      label="Assigned To"
                      emit-value
                      map-options
                      outlined
                      dense
                      clearable
                    />
                  </div>
                  <div class="col-12 q-mt-sm">
                    <q-btn
                      color="primary"
                      icon="filter_alt_off"
                      label="Clear Filters"
                      flat
                      class="full-width"
                      @click="taskStore.clearFilters"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Task List -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Tasks ({{ taskStore.filteredTasks.length }})</div>
          </q-card-section>

          <q-separator />

          <q-list separator>
            <q-item v-for="task in taskStore.filteredTasks" :key="task.id">
              <q-item-section avatar>
                <q-checkbox v-model="taskStore.selectedTasks" :val="task.id" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <div class="row items-center q-gutter-sm wrap">
                    <div class="text-weight-medium col-12 col-sm-grow">{{ task.title }}</div>
                    <div class="col-12 col-sm-auto">
                      <q-chip :color="getStateColor(task.state)" text-color="white" size="sm">
                        {{ getStateName(task.state) }}
                      </q-chip>
                      <q-chip :color="getPriorityColor(task.priority)" text-color="white" size="sm">
                        {{ getPriorityName(task.priority) }}
                      </q-chip>
                    </div>
                  </div>
                </q-item-label>
                <q-item-label caption>
                  {{ task.description }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center q-gutter-x-sm">
                  <q-btn flat round color="primary" icon="edit" size="sm" @click="editTask(task)" />
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="confirmDelete(task)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-card-section v-if="!taskStore.filteredTasks.length">
            <div class="text-center text-grey">No tasks found</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Bulk Actions -->
    <q-dialog v-model="bulkEditDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Bulk Update Tasks</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="bulkUpdates.state"
            :options="taskStore.states"
            option-label="name"
            option-value="id"
            label="State"
            clearable
            emit-value
            map-options
            class="q-mb-md"
          />
          <q-select
            v-model="bulkUpdates.priority"
            :options="taskStore.priorities"
            option-label="name"
            option-value="id"
            label="Priority"
            clearable
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Update" color="primary" @click="applyBulkUpdates" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from 'stores/task'
import { useQuasar } from 'quasar'

const emit = defineEmits(['edit-task'])

const $q = useQuasar()
const taskStore = useTaskStore()

const bulkEditDialog = ref(false)
const bulkUpdates = ref({
  state: null,
  priority: null,
})

// Load tasks when component is mounted
taskStore.fetchTasks()

function getStateColor(stateId) {
  const state = taskStore.states.find((s) => s.id === parseInt(stateId))
  return state?.color || 'grey'
}

function getStateName(stateId) {
  const state = taskStore.states.find((s) => s.id === parseInt(stateId))
  return state?.name || 'Unknown'
}

function getPriorityColor(priorityId) {
  const priority = taskStore.priorities.find((p) => p.id === parseInt(priorityId))
  return priority?.color || 'grey'
}

function getPriorityName(priorityId) {
  const priority = taskStore.priorities.find((p) => p.id === parseInt(priorityId))
  return priority?.name || 'Unknown'
}

function editTask(task) {
  // Emit event to parent to handle task editing
  emit('edit-task', task)
}

function confirmDelete(task) {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this task?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    taskStore.deleteTask(task.id)
  })
}

async function applyBulkUpdates() {
  const updates = {}
  if (bulkUpdates.value.state) updates.state = bulkUpdates.value.state
  if (bulkUpdates.value.priority) updates.priority = bulkUpdates.value.priority

  if (Object.keys(updates).length) {
    await taskStore.bulkUpdateTasks(updates)
    bulkUpdates.value = {
      state: null,
      priority: null,
    }
  }
}
</script>
