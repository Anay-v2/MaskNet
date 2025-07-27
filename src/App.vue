<script setup lang="ts">
import { RouterView } from 'vue-router'
import { firebaseConfig } from './utils/firebase'
import { initializeApp } from '@firebase/app'
import { getDatabase, ref as dbref } from '@firebase/database'
import { getAuth, onAuthStateChanged } from '@firebase/auth'
import { provide, type Ref } from 'vue'
import Loader from './components/Loader.vue'
import router from './router'
import { useReactiveDBRef } from './utils/dbuser'
import type { DBUser } from './utils/types'
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const auth = getAuth(app)

provide('app', app)
provide('db', db)
provide('auth', auth)
onAuthStateChanged(auth, () => {
  if(['/', '/auth'].includes(router.currentRoute.value.path) && auth.currentUser) {
    console.log('4')
    router.push('/')
  }
  else if(['/dash'].includes(router.currentRoute.value.path) && !auth.currentUser) {
    console.log('5')
    router.push('/')
  }
})
</script>

<template>
  <Suspense>
    <template #default><RouterView /></template>
    <template #fallback><Loader /></template>
  </Suspense>
</template>