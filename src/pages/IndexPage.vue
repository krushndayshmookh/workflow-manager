<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="text-h5">Task Manager</div>
      <q-space />
      <q-btn color="primary" icon="add" label="New Task" @click="showTaskForm = true" />
    </div>

    <!-- Task List Component -->
    <TaskList
      :tasks="tasks"
      :states="taskStates"
      :priorities="taskPriorities"
      :members="members"
      @edit-task="editTask"
    />

    <!-- Task Form Dialog -->
    <q-dialog v-model="showTaskForm" persistent>
      <TaskForm
        :task="selectedTask"
        @submit="onTaskSubmit"
        :members="members"
        v-model="showTaskForm"
        :states="taskStates"
        :priorities="taskPriorities"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TaskList from 'components/tasks/TaskList.vue'
import TaskForm from 'components/tasks/TaskForm.vue'
import { useProjectStore } from 'stores/project'
import { usePeopleStore } from 'stores/people'

const projectStore = useProjectStore()
const peopleStore = usePeopleStore()

const showTaskForm = ref(false)
const selectedTask = ref(null)

// Load data
onMounted(async () => {
  await projectStore.fetchUserProjects()
  await projectStore.fetchAllTasks()
  await peopleStore.fetchPeople()
})

// Computed properties
const tasks = computed(() => projectStore.allTasks)
const taskStates = computed(() => {
  const states = new Set()
  tasks.value.forEach((task) => {
    if (task.state) states.add(task.state)
  })
  return Array.from(states)
})
const taskPriorities = computed(() => {
  const priorities = new Set()
  tasks.value.forEach((task) => {
    if (task.priority) priorities.add(task.priority)
  })
  return Array.from(priorities)
})
const members = computed(() => peopleStore.people)

function editTask(task) {
  selectedTask.value = task
  showTaskForm.value = true
}

function onTaskSubmit() {
  showTaskForm.value = false
  selectedTask.value = null
}
</script>
