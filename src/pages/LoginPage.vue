<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card" flat bordered>
      <q-card-section class="text-center">
        <div class="text-h5 q-mb-md">Welcome Back</div>
        <div class="text-subtitle2 text-grey">Sign in to continue</div>
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
            :rules="[(val) => !!val || 'Password is required']"
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
              label="Sign In"
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
          <router-link to="/auth/signup" class="text-primary">
            Don't have an account? Sign up
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
})

const showPassword = ref(false)

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function onSubmit() {
  try {
    const { error } = await authStore.signIn(form.value.email, form.value.password)
    if (error) throw error
    router.push('/')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to sign in',
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
