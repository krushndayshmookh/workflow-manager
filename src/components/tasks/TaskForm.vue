<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    persistent
    maximized
    :class="$q.platform.is.mobile ? 'q-dialog--maximized' : ''"
  >
    <q-card :style="$q.platform.is.mobile ? {} : { maxWidth: '600px', margin: '32px auto' }">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ task.id ? 'Edit Task' : 'Create Task' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Title -->
          <q-input
            v-model="task.title"
            label="Title"
            :rules="[(val) => !!val || 'Title is required']"
            outlined
            autofocus
          />

          <!-- Description -->
          <q-input
            v-model="task.description"
            label="Description"
            type="textarea"
            outlined
            autogrow
          />

          <div class="row q-col-gutter-md">
            <!-- State -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="task.state_id"
                :options="states"
                option-label="name"
                option-value="id"
                label="State"
                outlined
                emit-value
                map-options
              >
                <!-- eslint-disable-next-line vue/no-unused-vars -->
                <template v-slot:option="{ itemProps, opt, selected }">
                  <q-item v-bind="itemProps">
                    <q-item-section>
                      <q-chip
                        :style="{ backgroundColor: opt.color }"
                        text-color="white"
                        size="sm"
                        class="q-mr-sm"
                      >
                        {{ opt.name }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Priority -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="task.priority_id"
                :options="priorities"
                option-label="name"
                option-value="id"
                label="Priority"
                outlined
                emit-value
                map-options
              >
                <!-- eslint-disable-next-line vue/no-unused-vars -->
                <template v-slot:option="{ itemProps, opt, selected }">
                  <q-item v-bind="itemProps">
                    <q-item-section>
                      <q-chip
                        :style="{ backgroundColor: opt.color }"
                        text-color="white"
                        size="sm"
                        class="q-mr-sm"
                      >
                        {{ opt.name }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Assignee -->
            <div class="col-12">
              <q-select
                v-model="task.assigned_to"
                :options="members"
                option-label="person.name"
                option-value="person.id"
                label="Assignee"
                outlined
                clearable
                emit-value
                map-options
              >
                <!-- eslint-disable-next-line vue/no-unused-vars -->
                <template v-slot:option="{ itemProps, opt, selected }">
                  <q-item v-bind="itemProps">
                    <q-item-section avatar>
                      <q-avatar size="26px">
                        <img
                          :src="
                            opt.person.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'
                          "
                        />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>{{ opt.person.name }}</q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected>
                  <template v-if="task.assigned_to">
                    <q-avatar size="26px" class="q-mr-sm">
                      <img
                        :src="
                          getSelectedMember?.person.avatar_url ||
                          'https://cdn.quasar.dev/img/boy-avatar.png'
                        "
                      />
                    </q-avatar>
                    {{ getSelectedMember?.person.name }}
                  </template>
                  <template v-else>Unassigned</template>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Due Date -->
          <q-input v-model="task.due_date" label="Due Date" outlined clearable>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="task.due_date" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Labels -->
          <q-select
            v-model="task.labels"
            label="Labels"
            outlined
            multiple
            use-chips
            use-input
            new-value-mode="add"
            input-debounce="0"
          >
            <template v-slot:chip="{ remove, label }">
              <q-chip
                removable
                @remove="remove"
                :style="{ backgroundColor: getLabelColor(label) }"
                text-color="white"
                size="sm"
              >
                {{ label }}
              </q-chip>
            </template>
          </q-select>

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancel" color="negative" flat v-close-popup />
            <q-btn
              :label="task.id ? 'Save' : 'Create'"
              type="submit"
              color="primary"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
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
  initialTask: {
    type: Object,
    default: () => ({}),
  },
  initialState: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['update:model-value', 'save'])

const $q = useQuasar()
const loading = ref(false)

const task = ref({
  title: '',
  description: '',
  state_id: props.initialState || (props.states[0]?.id ?? null),
  priority_id: props.priorities[0]?.id ?? null,
  assigned_to: null,
  due_date: null,
  labels: [],
  ...props.initialTask,
})

const getSelectedMember = computed(() => {
  return props.members.find((m) => m.person.id === task.value.assigned_to)
})

// Generate a random color for new labels
function getLabelColor(label) {
  const colors = [
    '#1976D2',
    '#2196F3',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFC107',
    '#FF9800',
    '#FF5722',
  ]
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

async function onSubmit() {
  try {
    loading.value = true
    await emit('save', { ...task.value })
    emit('update:model-value', false)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to save task',
    })
  } finally {
    loading.value = false
  }
}

// Reset form when dialog is opened
onMounted(() => {
  if (!props.initialTask.id) {
    task.value = {
      title: '',
      description: '',
      state_id: props.initialState || (props.states[0]?.id ?? null),
      priority_id: props.priorities[0]?.id ?? null,
      assigned_to: null,
      due_date: null,
      labels: [],
    }
  }
})
</script>

<style lang="scss" scoped>
.q-dialog--maximized {
  .q-card {
    max-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .q-card-section {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
