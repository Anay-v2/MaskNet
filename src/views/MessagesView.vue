<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import { useReactiveDBRef } from '@/utils/dbuser';
import type { DBUser } from '@/utils/types';
import { onAuthStateChanged, type Auth } from 'firebase/auth';
import { type Database, ref as dbref } from 'firebase/database';
import { inject, ref, type Ref } from 'vue';
const auth = inject('auth') as Auth
const db = inject('db') as Database
let dbuser = useReactiveDBRef(db, dbref(db, `users/${auth.currentUser?.uid || 's'}`)) as Ref<DBUser | null>
onAuthStateChanged(auth, async () => {
    dbuser = useReactiveDBRef(db, dbref(db, `users/${auth.currentUser?.uid || 's'}`))
})

function timeAgo(t: number) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = Date.now();
  const diff = (now - t);
  console.log(t, now, diff)
  const times = [
    { unit: 'year',   ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month',  ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'week',   ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: 'day',    ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour',   ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
    { unit: 'second', ms: 1000 },
  ];

  for (const { unit, ms } of times) {
    const delta = Math.floor(diff / ms);
    if (Math.abs(delta) >= 1) {
        // @ts-ignore
      return rtf.format(-delta, unit);
    }
  }
  return 'just now';
}
</script>
<template>
    <Navbar />
    <h1 class="text-5xl font-extrabold ml-10 my-10">Messages</h1>
    <div v-for="message in dbuser?.messages || []" :key="message.t" class="bg-pink-500 text-zinc-50 p-4 rounded-lg mb-4 w-screen">
        <p class="w-full text-md"><span class="w-[20%] inline-block">Anonymous</span><span class="w-[80%] text-right inline-block">{{ timeAgo(message.t) }}</span></p>
        <p class="font-medium text-lg break-words">{{ message.c }}</p>
    </div>
</template>