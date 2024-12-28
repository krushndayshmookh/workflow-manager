<template>
  <div class="project-list">
    <!-- Header with search and create button -->
    <div class="row items-center q-mb-lg">
      <div class="col-grow">
        <q-input
          v-model="search"
          dense
          outlined
          placeholder="Search projects..."
          class="project-search"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append v-if="search">
            <q-icon name="close" class="cursor-pointer" @click="search = ''" />
          </template>
        </q-input>
      </div>
      <div class="col-auto q-ml-md">
        <q-btn color="primary" icon="add" label="New Project" @click="showCreateDialog = true" />
      </div>
    </div>

    <!-- Project Grid -->
    <div class="row q-col-gutter-md">
      <template v-if="!projectStore.loading">
        <div v-for="project in filteredProjects" :key="project.id" class="col-12 col-sm-6 col-md-4">
          <q-card
            class="project-card cursor-pointer"
            :class="{ 'project-card--default': project.default_project }"
            @click="openProject(project)"
            v-ripple
          >
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col-grow">
                  <div class="text-h6 q-mb-xs">
                    <q-icon
                      :name="project.icon || 'folder'"
                      :style="{ color: project.color || 'inherit' }"
                      size="24px"
                      class="q-mr-sm"
                    />
                    {{ project.name }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ project.description || 'No description' }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    round
                    dense
                    icon="more_vert"
                    @click.stop="showProjectMenu(project, $event)"
                  >
                    <q-tooltip>More options</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pa-sm">
              <div class="row items-center justify-between">
                <div class="col-auto">
                  <q-avatar-group>
                    <q-avatar
                      v-for="member in getProjectMembers(project.id)"
                      :key="member.person.id"
                      size="24px"
                      class="cursor-pointer"
                    >
                      <img
                        :src="
                          member.person.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'
                        "
                      />
                      <q-tooltip>{{ member.person.name }}</q-tooltip>
                    </q-avatar>
                  </q-avatar-group>
                </div>
                <div class="col-auto text-grey text-caption">
                  {{ getProjectStats(project.id) }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Empty State -->
        <div v-if="filteredProjects.length === 0" class="col-12 text-center q-pa-xl">
          <div class="text-h6 text-grey q-mb-md">No projects found</div>
          <q-btn
            color="primary"
            icon="add"
            label="Create Project"
            @click="showCreateDialog = true"
          />
        </div>
      </template>

      <!-- Loading State -->
      <template v-else>
        <div v-for="n in 6" :key="n" class="col-12 col-sm-6 col-md-4">
          <q-card>
            <q-card-section>
              <q-skeleton type="text" class="text-h6" />
              <q-skeleton type="text" class="text-caption" />
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="row items-center justify-between">
                <q-skeleton type="QAvatar" size="24px" />
                <q-skeleton type="text" width="40px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </div>

    <!-- Create Project Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Create Project</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="createProject" class="q-gutter-md">
            <div class="row items-center q-mb-md">
              <q-btn
                :style="{ color: form.color || 'inherit' }"
                flat
                round
                :icon="form.icon || 'folder'"
                size="lg"
                class="q-mr-md"
              >
                <q-menu>
                  <div class="row q-pa-sm items-center">
                    <q-input v-model="form.icon" label="Icon (emoji)" dense outlined class="col" />
                  </div>
                </q-menu>
              </q-btn>
              <q-input v-model="form.color" label="Project Color" outlined dense class="col">
                <template v-slot:append>
                  <q-icon name="colorize" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-color v-model="form.color" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <q-input
              v-model="form.name"
              label="Name"
              :rules="[(val) => !!val || 'Name is required']"
              outlined
            />

            <q-input v-model="form.description" label="Description" type="textarea" outlined />

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" color="negative" flat v-close-popup />
              <q-btn label="Create" type="submit" color="primary" :loading="projectStore.loading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Project Menu -->
    <q-menu v-model="showMenu" :target="menuTarget">
      <q-list style="min-width: 150px">
        <q-item clickable v-close-popup @click="openProjectSettings">
          <q-item-section>Settings</q-item-section>
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup @click="deleteProject" class="text-negative">
          <q-item-section>Delete</q-item-section>
          <q-item-section avatar>
            <q-icon name="delete" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from 'stores/project'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const projectStore = useProjectStore()

const search = ref('')
const showCreateDialog = ref(false)
const showMenu = ref(false)
const menuTarget = ref(null)
const selectedProject = ref(null)

const form = ref({
  name: '',
  description: '',
  icon: '📁',
  color: '#1976D2',
})

const filteredProjects = computed(() => {
  if (!search.value) return projectStore.projects
  const searchLower = search.value.toLowerCase()
  return projectStore.projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower),
  )
})

function getProjectMembers(projectId) {
  return projectStore.members.filter((m) => m.project_id === projectId).slice(0, 5)
}

function getProjectStats(projectId) {
  const memberCount = projectStore.members.filter((m) => m.project_id === projectId).length
  return `${memberCount} member${memberCount !== 1 ? 's' : ''}`
}

async function createProject() {
  try {
    const { error } = await projectStore.createProject(form.value)
    if (error) throw error

    showCreateDialog.value = false
    form.value = {
      name: '',
      description: '',
      icon: '📁',
      color: '#1976D2',
    }

    $q.notify({
      type: 'positive',
      message: 'Project created successfully',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to create project',
    })
  }
}

function openProject(project) {
  router.push(`/projects/${project.id}`)
}

function showProjectMenu(project, event) {
  selectedProject.value = project
  menuTarget.value = event.target
  showMenu.value = true
}

function openProjectSettings() {
  if (selectedProject.value) {
    router.push(`/projects/${selectedProject.value.id}/settings`)
  }
}

async function deleteProject() {
  try {
    if (!selectedProject.value) return

    const confirm = await $q.dialog({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      cancel: true,
      persistent: true,
    })

    if (confirm) {
      const { error } = await projectStore.deleteProject(selectedProject.value.id)
      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Project deleted successfully',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to delete project',
    })
  }
}

onMounted(async () => {
  await projectStore.fetchUserProjects()
})
</script>

<style lang="scss" scoped>
.project-search {
  max-width: 300px;
}

.project-card {
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    border-color: $primary;
    transform: translateY(-2px);
  }

  &--default {
    border-color: $primary;
    background: linear-gradient(to right bottom, rgba(25, 118, 210, 0.05), transparent);
  }
}
</style>
