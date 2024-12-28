<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card" flat bordered>
      <q-card-section class="text-center">
        <div class="text-h5 q-mb-md">Create Account</div>
        <div class="text-subtitle2 text-grey">Sign up to get started</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.email"
            type="email"
            label="Email"
            outlined
            :rules="[
              (val) => !!val || 'Email is required',
              (val) => validateEmail(val) || 'Invalid email',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            outlined
            :rules="[
              (val) => !!val || 'Password is required',
              (val) => val.length >= 6 || 'Password must be at least 6 characters',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="form.confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            label="Confirm Password"
            outlined
            :rules="[
              (val) => !!val || 'Please confirm your password',
              (val) => val === form.password || 'Passwords do not match',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div>
            <q-btn
              label="Sign Up"
              type="submit"
              color="primary"
              class="full-width"
              size="lg"
              :loading="authStore.loading"
            />
          </div>
        </q-form>

        <div class="text-center q-py-md">
          <div class="text-grey">Or continue with</div>
        </div>

        <div>
          <q-btn
            class="full-width"
            outline
            color="primary"
            @click="signInWithGoogle"
            :loading="authStore.loading"
            size="lg"
          >
            <q-icon name="img:https://www.google.com/favicon.ico" class="q-mr-sm" />
            Google
          </q-btn>
        </div>

        <div class="text-center q-pt-lg">
          <router-link to="/auth/login" class="text-primary">
            Already have an account? Sign in
          </router-link>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function onSubmit() {
  try {
    const { error } = await authStore.signUp(form.value.email, form.value.password)
    if (error) throw error
    $q.notify({
      type: 'positive',
      message: 'Please check your email to confirm your account',
    })
    router.push('/auth/login')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to sign up',
    })
  }
}

async function signInWithGoogle() {
  try {
    const { error } = await authStore.signInWithGoogle()
    if (error) throw error
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to sign in with Google',
    })
  }
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
  margin: 0 20px;
  background: rgba(255, 255, 255, 0.95);
}
</style>
