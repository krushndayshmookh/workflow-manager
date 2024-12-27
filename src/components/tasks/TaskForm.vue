<template>
  <q-card style="min-width: 400px">
    <q-card-section>
      <div class="text-h6">{{ task ? 'Edit Task' : 'New Task' }}</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          v-model="form.title"
          label="Title"
          :rules="[(val) => !!val || 'Title is required']"
          outlined
          dense
        />

        <q-input v-model="form.description" label="Description" type="textarea" outlined dense />

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="form.state"
              :options="taskStore.states"
              option-label="name"
              option-value="id"
              label="State"
              emit-value
              map-options
              outlined
              dense
              :rules="[(val) => !!val || 'State is required']"
            />
          </div>

          <div class="col-12 col-sm-6">
            <q-select
              v-model="form.priority"
              :options="taskStore.priorities"
              option-label="name"
              option-value="id"
              label="Priority"
              emit-value
              map-options
              outlined
              dense
              :rules="[(val) => !!val || 'Priority is required']"
            />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.business_value"
              type="number"
              label="Business Value"
              outlined
              dense
            />
          </div>

          <div class="col-12 col-sm-6">
            <q-input v-model="form.due_at" type="date" label="Due Date" outlined dense />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="form.assigned_to"
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

          <div class="col-12 col-sm-6">
            <q-select
              v-model="form.project"
              :options="projects"
              option-label="name"
              option-value="id"
              label="Project"
              emit-value
              map-options
              outlined
              dense
              clearable
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.icon }} {{ scope.opt.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>

        <div class="row justify-end q-gutter-sm">
          <q-btn label="Cancel" color="negative" flat v-close-popup />
          <q-btn :label="task ? 'Update' : 'Create'" type="submit" color="primary" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTaskStore } from 'stores/task'
import { useProjectStore } from 'stores/project'

const props = defineProps({
  task: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit'])
const taskStore = useTaskStore()
const projectStore = useProjectStore()

// Sample data for people and projects (should come from stores)
const people = [
  { email: 'krushn', name: 'Krushn' },
  { email: 'ankita', name: 'Ankita' },
  { email: 'sahil', name: 'Sahil' },
  { email: 'tushar', name: 'Tushar' },
  { email: 'kaushal', name: 'Kaushal' },
]

const projects = computed(() => projectStore.projectsWithIcons)

const form = ref({
  title: '',
  description: '',
  state: 1, // Default to "To Do"
  priority: 2, // Default to "Medium"
  business_value: 100,
  assigned_to: '',
  project: '',
  due_at: null,
})

onMounted(() => {
  projectStore.fetchProjects()
  if (props.task) {
    form.value = { ...props.task }
  }
})

async function onSubmit() {
  if (props.task) {
    await taskStore.updateTask(props.task.id, form.value)
  } else {
    await taskStore.addTask(form.value)
  }
  emit('submit')
}
</script>
