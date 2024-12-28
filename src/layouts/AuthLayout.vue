<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-toolbar-title class="text-center"> Workflow Manager </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container class="auth-background">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.auth-background {
  background: linear-gradient(145deg, var(--q-primary) 0%, #1976d2 100%);
  min-height: 100vh;
}
</style>
