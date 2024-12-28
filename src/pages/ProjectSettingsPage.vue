<template>
  <q-page class="q-pa-md">
    <template v-if="!projectStore.loading">
      <!-- Header -->
      <div class="text-h5 q-mb-lg">Project Settings</div>

      <div class="row q-col-gutter-lg">
        <!-- Project Details -->
        <div class="col-12 col-md-8">
          <q-card>
            <q-card-section>
              <div class="text-h6">Project Details</div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-form @submit="saveProject" class="q-gutter-md">
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
                        <q-input
                          v-model="form.icon"
                          label="Icon (emoji)"
                          dense
                          outlined
                          class="col"
                        />
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

                <div class="row justify-end">
                  <q-btn label="Save Changes" type="submit" color="primary" :loading="saving" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>

          <!-- Task States -->
          <q-card class="q-mt-md">
            <q-card-section>
              <div class="text-h6">Task States</div>
              <div class="text-caption text-grey">
                Customize the workflow states for tasks in this project
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="q-gutter-y-sm">
                <q-list separator>
                  <q-item v-for="state in projectStore.taskStates" :key="state.id" class="q-py-md">
                    <q-item-section avatar>
                      <q-chip
                        :style="{ backgroundColor: state.color }"
                        text-color="white"
                        size="sm"
                      >
                        {{ state.name }}
                      </q-chip>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ state.description }}</q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <div class="row items-center q-gutter-sm">
                        <q-btn flat round dense icon="edit" @click="editState(state)">
                          <q-tooltip>Edit state</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete"
                          color="negative"
                          @click="deleteState(state)"
                        >
                          <q-tooltip>Delete state</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>

                <div class="q-mt-md">
                  <q-btn
                    color="primary"
                    icon="add"
                    label="Add State"
                    @click="showStateDialog = true"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Task Priorities -->
          <q-card class="q-mt-md">
            <q-card-section>
              <div class="text-h6">Task Priorities</div>
              <div class="text-caption text-grey">
                Customize the priority levels for tasks in this project
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="q-gutter-y-sm">
                <q-list separator>
                  <q-item
                    v-for="priority in projectStore.taskPriorities"
                    :key="priority.id"
                    class="q-py-md"
                  >
                    <q-item-section avatar>
                      <q-chip
                        :style="{ backgroundColor: priority.color }"
                        text-color="white"
                        size="sm"
                      >
                        {{ priority.name }}
                      </q-chip>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ priority.description }}</q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <div class="row items-center q-gutter-sm">
                        <q-btn flat round dense icon="edit" @click="editPriority(priority)">
                          <q-tooltip>Edit priority</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete"
                          color="negative"
                          @click="deletePriority(priority)"
                        >
                          <q-tooltip>Delete priority</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>

                <div class="q-mt-md">
                  <q-btn
                    color="primary"
                    icon="add"
                    label="Add Priority"
                    @click="showPriorityDialog = true"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Members -->
        <div class="col-12 col-md-4">
          <q-card>
            <q-card-section>
              <div class="text-h6">Members</div>
              <div class="text-caption text-grey">Manage who has access to this project</div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-list separator>
                <q-item v-for="member in projectStore.members" :key="member.person.id">
                  <q-item-section avatar>
                    <q-avatar size="32px">
                      <img
                        :src="
                          member.person.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'
                        "
                      />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ member.person.name }}</q-item-label>
                    <q-item-label caption>{{ member.person.email }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-select
                      v-model="member.role"
                      :options="[
                        { label: 'Admin', value: 'admin' },
                        { label: 'Member', value: 'member' },
                      ]"
                      dense
                      options-dense
                      emit-value
                      map-options
                      borderless
                      @update:model-value="updateMemberRole(member)"
                    />
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      color="negative"
                      @click="removeMember(member)"
                    >
                      <q-tooltip>Remove member</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="q-mt-md">
                <q-btn
                  color="primary"
                  icon="person_add"
                  label="Add Member"
                  @click="showInviteDialog = true"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Danger Zone -->
          <q-card class="q-mt-md bg-red-1">
            <q-card-section>
              <div class="text-h6 text-negative">Danger Zone</div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-btn
                color="negative"
                label="Delete Project"
                class="full-width"
                @click="confirmDelete"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- Loading State -->
    <template v-else>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-8">
          <q-card>
            <q-card-section>
              <q-skeleton type="text" class="text-h6" />
              <q-skeleton type="text" class="q-mt-sm" />
              <q-skeleton type="text" class="q-mt-sm" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card>
            <q-card-section>
              <q-skeleton type="text" class="text-h6" />
              <q-skeleton type="text" class="q-mt-sm" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- State Dialog -->
    <q-dialog v-model="showStateDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingState ? 'Edit' : 'Add' }} State</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveState" class="q-gutter-md">
            <q-input v-model="stateForm.name" label="Name" outlined :rules="[required]" />
            <q-input v-model="stateForm.description" label="Description" type="textarea" outlined />
            <q-input v-model="stateForm.color" label="Color" outlined>
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="stateForm.color" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" color="negative" flat v-close-popup />
              <q-btn :label="editingState ? 'Save' : 'Add'" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Priority Dialog -->
    <q-dialog v-model="showPriorityDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingPriority ? 'Edit' : 'Add' }} Priority</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePriority" class="q-gutter-md">
            <q-input v-model="priorityForm.name" label="Name" outlined :rules="[required]" />
            <q-input
              v-model="priorityForm.description"
              label="Description"
              type="textarea"
              outlined
            />
            <q-input v-model="priorityForm.color" label="Color" outlined>
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="priorityForm.color" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" color="negative" flat v-close-popup />
              <q-btn :label="editingPriority ? 'Save' : 'Add'" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Invite Dialog -->
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
              :rules="[required, validateEmail]"
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
              <q-btn label="Invite" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from 'stores/project'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const saving = ref(false)
const showStateDialog = ref(false)
const showPriorityDialog = ref(false)
const showInviteDialog = ref(false)

const form = ref({
  name: '',
  description: '',
  icon: '📁',
  color: '#1976D2',
})

const stateForm = ref({
  name: '',
  description: '',
  color: '#1976D2',
})

const priorityForm = ref({
  name: '',
  description: '',
  color: '#1976D2',
})

const inviteForm = ref({
  email: '',
  role: 'member',
})

const editingState = ref(null)
const editingPriority = ref(null)

// Form validation
const required = (val) => !!val || 'Field is required'
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || 'Invalid email'

// Load project data
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await projectStore.setCurrentProject(newId)
      form.value = {
        name: projectStore.currentProject?.name || '',
        description: projectStore.currentProject?.description || '',
        icon: projectStore.currentProject?.icon || '📁',
        color: projectStore.currentProject?.color || '#1976D2',
      }
    }
  },
  { immediate: true },
)

// Project actions
async function saveProject() {
  try {
    saving.value = true
    const { error } = await projectStore.updateProject(route.params.id, form.value)
    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Project updated successfully',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to update project',
    })
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  try {
    const confirm = await $q.dialog({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      cancel: true,
      persistent: true,
    })

    if (confirm) {
      const { error } = await projectStore.deleteProject(route.params.id)
      if (error) throw error

      router.push('/projects')
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

// State actions
function editState(state) {
  editingState.value = state
  stateForm.value = { ...state }
  showStateDialog.value = true
}

async function saveState() {
  try {
    if (editingState.value) {
      const { error } = await projectStore.updateTaskState(editingState.value.id, stateForm.value)
      if (error) throw error
    } else {
      const { error } = await projectStore.createTaskState({
        ...stateForm.value,
        project_id: route.params.id,
      })
      if (error) throw error
    }

    showStateDialog.value = false
    stateForm.value = {
      name: '',
      description: '',
      color: '#1976D2',
    }
    editingState.value = null

    $q.notify({
      type: 'positive',
      message: `State ${editingState.value ? 'updated' : 'created'} successfully`,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || `Failed to ${editingState.value ? 'update' : 'create'} state`,
    })
  }
}

async function deleteState(state) {
  try {
    const confirm = await $q.dialog({
      title: 'Delete State',
      message: 'Are you sure you want to delete this state?',
      cancel: true,
      persistent: true,
    })

    if (confirm) {
      const { error } = await projectStore.deleteTaskState(state.id)
      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'State deleted successfully',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to delete state',
    })
  }
}

// Priority actions
function editPriority(priority) {
  editingPriority.value = priority
  priorityForm.value = { ...priority }
  showPriorityDialog.value = true
}

async function savePriority() {
  try {
    if (editingPriority.value) {
      const { error } = await projectStore.updateTaskPriority(
        editingPriority.value.id,
        priorityForm.value,
      )
      if (error) throw error
    } else {
      const { error } = await projectStore.createTaskPriority({
        ...priorityForm.value,
        project_id: route.params.id,
      })
      if (error) throw error
    }

    showPriorityDialog.value = false
    priorityForm.value = {
      name: '',
      description: '',
      color: '#1976D2',
    }
    editingPriority.value = null

    $q.notify({
      type: 'positive',
      message: `Priority ${editingPriority.value ? 'updated' : 'created'} successfully`,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || `Failed to ${editingPriority.value ? 'update' : 'create'} priority`,
    })
  }
}

async function deletePriority(priority) {
  try {
    const confirm = await $q.dialog({
      title: 'Delete Priority',
      message: 'Are you sure you want to delete this priority?',
      cancel: true,
      persistent: true,
    })

    if (confirm) {
      const { error } = await projectStore.deleteTaskPriority(priority.id)
      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Priority deleted successfully',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to delete priority',
    })
  }
}

// Member actions
async function inviteMember() {
  try {
    const { error } = await projectStore.inviteMember(
      route.params.id,
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

async function updateMemberRole(member) {
  try {
    const { error } = await projectStore.updateMemberRole(
      route.params.id,
      member.person.id,
      member.role,
    )
    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Member role updated successfully',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to update member role',
    })
  }
}

async function removeMember(member) {
  try {
    const confirm = await $q.dialog({
      title: 'Remove Member',
      message: 'Are you sure you want to remove this member from the project?',
      cancel: true,
      persistent: true,
    })

    if (confirm) {
      const { error } = await projectStore.removeMember(route.params.id, member.person.id)
      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Member removed successfully',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to remove member',
    })
  }
}
</script>
