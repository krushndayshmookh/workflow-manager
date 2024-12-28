<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="lt-md"
        />

        <q-toolbar-title class="text-center gt-sm"> Workflow Manager </q-toolbar-title>
        <q-toolbar-title class="lt-md"> WM </q-toolbar-title>

        <q-space />

        <q-btn flat round>
          <q-avatar size="26px">
            <img :src="currentUser?.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'" alt="avatar default image" />
          </q-avatar>
          <q-menu>
            <q-list style="min-width: 150px">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ currentUser?.name }}</q-item-label>
                  <q-item-label caption>{{ currentUser?.email }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable to="/profile" v-close-popup>
                <q-item-section>Profile</q-item-section>
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
              </q-item>
              <q-item clickable @click="signOut">
                <q-item-section>Sign Out</q-item-section>
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :breakpoint="1023" bordered class="bg-white">
      <q-list>
        <q-item-label header> Navigation </q-item-label>

        <q-item to="/" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="task" />
          </q-item-section>

          <q-item-section> Tasks </q-item-section>
        </q-item>

        <q-item to="/projects" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>

          <q-item-section> Projects </q-item-section>
        </q-item>

        <q-item to="/people" exact clickable v-ripple v-if="isAdmin">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>

          <q-item-section> People </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from 'stores/auth'
import { usePeopleStore } from 'stores/people'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const peopleStore = usePeopleStore()
const router = useRouter()
const leftDrawerOpen = ref(false)

const currentUser = computed(() => {
  return peopleStore.getCurrentUser()
})

const isAdmin = computed(() => {
  return currentUser.value?.role === 'admin'
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function signOut() {
  router.push('/auth/login')
  authStore.signOut()
}
</script>
