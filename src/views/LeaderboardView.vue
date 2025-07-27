<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import { useReactiveDBRef } from '@/utils/dbuser';
import { type Database, ref as dbref } from 'firebase/database';
import { computed, inject } from 'vue';
    const db = inject('db') as Database
    const users = useReactiveDBRef(db, dbref(db, 'users'));
    const lboard = computed(() => (Object.values(users.value) || []).map(user => ({n: user.username, c: user.credits}))
        .sort((a, b) => (b.c || 0) - (a.c || 0))
        .slice(0, 10))
</script>
<template>
    <Navbar />
    <h1 class="text-3xl font-bold mb-4">Leaderboard</h1>
    <DataTable :value="lboard" class="w-screen">
        <Column field="n" header="Username"></Column>
        <Column field="c" header="Credits"></Column>
    </DataTable>
</template>