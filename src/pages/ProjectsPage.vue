<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="text-h5">Projects</div>
      <q-space />
      <q-btn color="primary" icon="add" label="New Project" @click="showProjectForm = true" />
    </div>

    <!-- Projects List -->
    <div class="row q-col-gutter-md">
      <div
        v-for="project in projectStore.projects"
        :key="project.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="text-h6">{{ project.icon }} {{ project.name }}</div>
              <q-space />
              <q-btn flat round color="primary" icon="edit" @click="editProject(project)" />
              <q-btn flat round color="negative" icon="delete" @click="confirmDelete(project)" />
            </div>
          </q-card-section>

          <q-card-section>
            <p class="text-body1">{{ project.description || 'No description' }}</p>
          </q-card-section>

          <q-card-section>
            <div class="row items-center">
              <q-chip :style="{ backgroundColor: project.color }" text-color="white">
                {{ project.color }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Project Form Dialog -->
    <q-dialog v-model="showProjectForm" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ selectedProject ? 'Edit Project' : 'New Project' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Name"
              :rules="[(val) => !!val || 'Name is required']"
              outlined
              dense
            />

            <q-input
              v-model="form.description"
              label="Description"
              type="textarea"
              outlined
              dense
            />

            <q-input
              v-model="form.icon"
              label="Icon (emoji)"
              :rules="[(val) => !!val || 'Icon is required']"
              outlined
              dense
            />

            <q-input
              v-model="form.color"
              label="Color"
              :rules="[(val) => !!val || 'Color is required']"
              outlined
              dense
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="form.color" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" color="negative" flat v-close-popup />
              <q-btn :label="selectedProject ? 'Update' : 'Create'" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProjectStore } from 'stores/project'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const projectStore = useProjectStore()

const showProjectForm = ref(false)
const selectedProject = ref(null)

const form = ref({
  name: '',
  description: '',
  icon: '📁',
  color: '#1976D2',
})

onMounted(() => {
  projectStore.fetchProjects()
})

function editProject(project) {
  selectedProject.value = project
  form.value = { ...project }
  showProjectForm.value = true
}

function confirmDelete(project) {
  $q.dialog({
    title: 'Confirm',
    message:
      'Are you sure you want to delete this project? This will not delete the tasks in this project.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await projectStore.deleteProject(project.id)
  })
}

async function onSubmit() {
  try {
    if (selectedProject.value) {
      await projectStore.updateProject(selectedProject.value.id, form.value)
    } else {
      await projectStore.addProject(form.value)
    }
    showProjectForm.value = false
    selectedProject.value = null
    form.value = {
      name: '',
      description: '',
      icon: '📁',
      color: '#1976D2',
    }
  } catch (error) {
    console.error('Error saving project:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to save project',
      icon: 'error',
    })
  }
}
</script>
