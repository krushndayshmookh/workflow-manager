<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h5">People</div>
      <q-space />
      <q-btn color="primary" icon="person_add" label="Add Person" @click="showPersonForm = true" />
    </div>

    <!-- People List -->
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-4">
                <q-input v-model="search" dense outlined placeholder="Search people..." clearable>
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4 q-mt-sm q-mt-md-none">
                <q-select
                  v-model="roleFilter"
                  :options="roles"
                  label="Filter by role"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>
            </div>

            <q-table
              :rows="filteredPeople"
              :columns="columns"
              row-key="id"
              :loading="peopleStore.loading"
              :filter="search"
              flat
              bordered
            >
              <!-- Avatar and Name column -->
              <template v-slot:body-cell-name="props">
                <q-td :props="props">
                  <div class="row items-center">
                    <q-avatar size="32px" class="q-mr-sm">
                      <img
                        :src="props.row.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'"
                      />
                    </q-avatar>
                    <div>
                      <div class="text-weight-medium">{{ props.row.name }}</div>
                      <div class="text-caption text-grey">{{ props.row.email }}</div>
                    </div>
                  </div>
                </q-td>
              </template>

              <!-- Role column -->
              <template v-slot:body-cell-role="props">
                <q-td :props="props">
                  <q-chip :color="getRoleColor(props.row.role)" text-color="white" size="sm">
                    {{ props.row.role }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Actions column -->
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="edit"
                    size="sm"
                    @click="editPerson(props.row)"
                  >
                    <q-tooltip>Edit Person</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Person Form Dialog -->
    <q-dialog v-model="showPersonForm" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ selectedPerson ? 'Edit Person' : 'Add Person' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Name"
              :rules="[(val) => !!val || 'Name is required']"
              outlined
            />

            <q-input
              v-model="form.email"
              type="email"
              label="Email"
              :rules="[
                (val) => !!val || 'Email is required',
                (val) => validateEmail(val) || 'Invalid email',
              ]"
              outlined
            />

            <q-select
              v-model="form.role"
              :options="roles"
              label="Role"
              outlined
              :rules="[(val) => !!val || 'Role is required']"
              emit-value
              map-options
            />

            <q-input v-model="form.avatar_url" label="Avatar URL" outlined />

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" color="negative" flat v-close-popup />
              <q-btn :label="selectedPerson ? 'Update' : 'Create'" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeopleStore } from 'stores/people'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const peopleStore = usePeopleStore()

const search = ref('')
const roleFilter = ref(null)
const showPersonForm = ref(false)
const selectedPerson = ref(null)

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
]

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: 'name',
  },
  {
    name: 'role',
    required: true,
    label: 'Role',
    align: 'left',
    field: 'role',
  },
  {
    name: 'actions',
    required: true,
    label: 'Actions',
    align: 'right',
  },
]

const form = ref({
  name: '',
  email: '',
  role: 'member',
  avatar_url: '',
})

const filteredPeople = computed(() => {
  let filtered = [...peopleStore.people]
  if (roleFilter.value) {
    filtered = filtered.filter((person) => person.role === roleFilter.value)
  }
  return filtered
})

function getRoleColor(role) {
  switch (role) {
    case 'admin':
      return 'purple'
    case 'member':
      return 'blue'
    default:
      return 'grey'
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function editPerson(person) {
  selectedPerson.value = person
  form.value = { ...person }
  showPersonForm.value = true
}

async function onSubmit() {
  try {
    let result
    if (selectedPerson.value) {
      result = await peopleStore.updatePerson(selectedPerson.value.id, form.value)
    } else {
      result = await peopleStore.createPerson(form.value)
    }

    if (result.error) throw result.error

    showPersonForm.value = false
    selectedPerson.value = null
    form.value = {
      name: '',
      email: '',
      role: 'member',
      avatar_url: '',
    }

    $q.notify({
      type: 'positive',
      message: `Person ${selectedPerson.value ? 'updated' : 'created'} successfully`,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || `Failed to ${selectedPerson.value ? 'update' : 'create'} person`,
    })
  }
}

onMounted(async () => {
  await peopleStore.fetchPeople()
})
</script>
