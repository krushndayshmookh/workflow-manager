<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h5">Profile</div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">Personal Information</div>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <div class="row items-center q-mb-md">
                <q-avatar size="100px" class="q-mr-md">
                  <img :src="form.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'" alt="avatar default icon" />
                </q-avatar>
                <div class="column">
                  <div class="text-weight-medium q-mb-sm">Profile Picture</div>
                  <q-input
                    v-model="form.avatar_url"
                    label="Avatar URL"
                    outlined
                    dense
                    class="col"
                  />
                </div>
              </div>

              <q-input
                v-model="form.name"
                label="Name"
                outlined
                :rules="[(val) => !!val || 'Name is required']"
              />

              <q-input v-model="form.email" type="email" label="Email" outlined readonly disable />

              <div class="row items-center q-mt-lg">
                <q-chip :color="getRoleColor(form.role)" text-color="white">
                  {{ form.role }}
                </q-chip>
                <q-space />
                <q-btn label="Save Changes" type="submit" color="primary" :loading="loading" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Account Settings</div>
            <div class="q-mt-md">
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label>Change Password</q-item-label>
                    <q-item-label caption>
                      Update your password to keep your account secure
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      color="primary"
                      label="Change"
                      @click="showChangePasswordDialog = true"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Change Password Dialog -->
    <q-dialog v-model="showChangePasswordDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Change Password</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="onChangePassword" class="q-gutter-md">
            <q-input
              v-model="passwordForm.current"
              type="password"
              label="Current Password"
              outlined
              :rules="[(val) => !!val || 'Current password is required']"
            />

            <q-input
              v-model="passwordForm.new"
              type="password"
              label="New Password"
              outlined
              :rules="[
                (val) => !!val || 'New password is required',
                (val) => val.length >= 6 || 'Password must be at least 6 characters',
              ]"
            />

            <q-input
              v-model="passwordForm.confirm"
              type="password"
              label="Confirm New Password"
              outlined
              :rules="[
                (val) => !!val || 'Please confirm your password',
                (val) => val === passwordForm.new || 'Passwords do not match',
              ]"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" color="negative" flat v-close-popup />
              <q-btn label="Update Password" type="submit" color="primary" :loading="loading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePeopleStore } from 'stores/people'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'

const $q = useQuasar()
const peopleStore = usePeopleStore()
const authStore = useAuthStore()

const loading = ref(false)
const showChangePasswordDialog = ref(false)

const form = ref({
  name: '',
  email: '',
  role: '',
  avatar_url: '',
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: '',
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

async function onSubmit() {
  try {
    loading.value = true
    const { error } = await peopleStore.updatePerson(authStore.user.id, {
      name: form.value.name,
      avatar_url: form.value.avatar_url,
    })

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to update profile',
    })
  } finally {
    loading.value = false
  }
}

async function onChangePassword() {
  try {
    loading.value = true
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.value.new,
    })

    if (error) throw error

    showChangePasswordDialog.value = false
    passwordForm.value = {
      current: '',
      new: '',
      confirm: '',
    }

    $q.notify({
      type: 'positive',
      message: 'Password updated successfully',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to update password',
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const person = await peopleStore.getCurrentUser()
  if (person) {
    form.value = { ...person }
  }
})
</script>
