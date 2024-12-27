<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="text-h5">Task Manager</div>
      <q-space />
      <q-btn color="primary" icon="add" label="New Task" @click="showTaskForm = true" />
    </div>

    <!-- Task List Component -->
    <TaskList @edit-task="editTask" />

    <!-- Task Form Dialog -->
    <q-dialog v-model="showTaskForm" persistent>
      <TaskForm :task="selectedTask" @submit="onTaskSubmit" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import TaskList from 'components/tasks/TaskList.vue'
import TaskForm from 'components/tasks/TaskForm.vue'

const showTaskForm = ref(false)
const selectedTask = ref(null)

function editTask(task) {
  selectedTask.value = task
  showTaskForm.value = true
}

function onTaskSubmit() {
  showTaskForm.value = false
  selectedTask.value = null
}
</script>
