<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import { useReactiveDBRef } from '@/utils/dbuser';
import { games } from '@/utils/games';
import type { DBUser } from '@/utils/types';
import { onAuthStateChanged, type Auth } from 'firebase/auth';
import { type Database, ref as dbref } from 'firebase/database';
import { inject, ref, type Ref } from 'vue';

const sGame = ref(games[0])
const rulesDialog = ref(false)

function openGame(game: typeof games[0]) {
    sGame.value = game
    rulesDialog.value = true
}
const auth = inject('auth') as Auth
const db = inject('db') as Database
let dbuser = useReactiveDBRef(db, dbref(db, `users/${auth.currentUser?.uid || 's'}`)) as Ref<DBUser | null>
onAuthStateChanged(auth, async () => {
    dbuser = useReactiveDBRef(db, dbref(db, `users/${auth.currentUser?.uid || 's'}`))
})
</script>

<template>
    <Navbar />
    <h1 class="text-5xl font-extrabold ml-10 my-10">Games</h1>
    <div class="grid grid-cols-3 grid-rows-1 gap-4 mx-10">
        <Card v-for="game in games" :key="game.id" class="!bg-pink-500 !text-zinc-50">
            <template #title><span class="font-bold">{{ game.name }}</span></template>
            <template #subtitle><Badge class="!bg-red-500 mr-4 !text-zinc-50">-{{ game.cost }} ₩</Badge><Badge class="!bg-green-500 !text-zinc-50">+{{ game.gain }} ₩</Badge></template>
            <template #content><p class="font-medium">{{ game.sdesc }}</p></template>
            <template #footer>
                <div class="flex mt-1 gap-2 w-full">
                    <Button class="!bg-pink-700 !text-zinc-50 hover:!bg-pink-600 !border-0" @click="$router.push('/game/' + game.id)" :disabled="(dbuser?.credits || 0) < game.cost || !dbuser">Play</Button>
                    <Button class="!bg-cyan-700 !text-zinc-50 hover:!bg-cyan-600 !border-0" @click="openGame(game)">Rules</Button>
                </div>
            </template>
        </Card>
    </div>
    <Dialog v-model:visible="rulesDialog" modal :header="'Rules of ' + sGame.name" class="w-[60vw] h-[60vh] !bg-pink-500 !border-0 modal">
        <p class="font-medium">{{ sGame?.ldesc }}</p>
        <p class="font-medium">It costs {{ sGame?.cost }} ₩ to play this game, and you win {{ sGame?.gain }} ₩ if you succeed.</p>
    </Dialog>
</template>