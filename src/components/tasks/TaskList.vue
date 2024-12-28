<template>
  <div class="task-list">
    <q-list separator>
      <q-item v-for="task in tasks" :key="task.id" class="task-item q-py-md">
        <q-item-section avatar>
          <q-checkbox v-model="task.completed" @update:model-value="toggleTaskComplete(task)" />
        </q-item-section>

        <q-item-section>
          <div class="row items-center q-gutter-x-md">
            <!-- State Dropdown -->
            <div class="cursor-pointer">
              <q-btn
                :style="{ color: task.state?.color || 'grey' }"
                flat
                dense
                :label="task.state?.name || 'No State'"
                class="state-btn"
                @click="showStateMenu($event, task)"
              >
                <q-menu v-model="stateMenu[task.id]" anchor="bottom left" self="top left">
                  <q-list style="min-width: 150px">
                    <q-item
                      v-for="state in states"
                      :key="state.id"
                      clickable
                      v-close-popup
                      @click="updateTaskState(task, state.id)"
                    >
                      <q-item-section>
                        <q-chip
                          :style="{ backgroundColor: state.color }"
                          text-color="white"
                          size="sm"
                        >
                          {{ state.name }}
                        </q-chip>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <!-- Priority Dropdown -->
            <div class="cursor-pointer">
              <q-btn
                :style="{ color: task.priority?.color || 'grey' }"
                flat
                dense
                :label="task.priority?.name || 'No Priority'"
                class="priority-btn"
                @click="showPriorityMenu($event, task)"
              >
                <q-menu v-model="priorityMenu[task.id]" anchor="bottom left" self="top left">
                  <q-list style="min-width: 150px">
                    <q-item
                      v-for="priority in priorities"
                      :key="priority.id"
                      clickable
                      v-close-popup
                      @click="updateTaskPriority(task, priority.id)"
                    >
                      <q-item-section>
                        <q-chip
                          :style="{ backgroundColor: priority.color }"
                          text-color="white"
                          size="sm"
                        >
                          {{ priority.name }}
                        </q-chip>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <!-- Task Title -->
            <div class="text-weight-medium" :class="{ 'text-strike': task.completed }">
              {{ task.title }}
            </div>
          </div>

          <!-- Task Description -->
          <div v-if="task.description" class="text-grey text-caption q-mt-xs">
            {{ task.description }}
          </div>
        </q-item-section>

        <!-- Assignee -->
        <q-item-section side>
          <div class="row items-center q-gutter-x-sm">
            <q-btn flat round dense class="assignee-btn" @click="showAssigneeMenu($event, task)">
              <q-avatar size="26px">
                <img
                  :src="task.assignee?.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'"
                />
              </q-avatar>
              <q-tooltip>{{ task.assignee?.name || 'Unassigned' }}</q-tooltip>

              <q-menu v-model="assigneeMenu[task.id]" anchor="bottom right" self="top right">
                <q-list style="min-width: 200px">
                  <q-item
                    v-for="member in members"
                    :key="member.id"
                    clickable
                    v-close-popup
                    @click="assignTask(task, member.id)"
                  >
                    <q-item-section avatar>
                      <q-avatar size="26px">
                        <img
                          :src="member.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'"
                        />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>{{ member.name }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="unassignTask(task)">
                    <q-item-section>Unassign</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>

            <!-- Actions -->
            <q-btn flat round dense icon="more_vert">
              <q-menu anchor="bottom right" self="top right">
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
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from 'stores/task'

defineProps({
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

defineEmits(['edit-task', 'delete-task'])

const taskStore = useTaskStore()

// Menu state
const stateMenu = ref({})
const priorityMenu = ref({})
const assigneeMenu = ref({})

// Menu handlers
function showStateMenu(event, task) {
  stateMenu.value[task.id] = true
}

function showPriorityMenu(event, task) {
  priorityMenu.value[task.id] = true
}

function showAssigneeMenu(event, task) {
  assigneeMenu.value[task.id] = true
}

// Task actions
async function updateTaskState(task, stateId) {
  await taskStore.updateTask(task.id, { state_id: stateId })
}

async function updateTaskPriority(task, priorityId) {
  await taskStore.updateTask(task.id, { priority_id: priorityId })
}

async function assignTask(task, personId) {
  await taskStore.updateTask(task.id, { assigned_to: personId })
}

async function unassignTask(task) {
  await taskStore.updateTask(task.id, { assigned_to: null })
}

async function toggleTaskComplete(task) {
  await taskStore.updateTask(task.id, { completed: task.completed })
}
</script>

<style lang="scss" scoped>
.task-item {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}

.state-btn,
.priority-btn {
  min-width: 100px;
  text-align: left;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.assignee-btn {
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}
</style>
