<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import { useReactiveDBRef } from '@/utils/dbuser';
import type { DBUser } from '@/utils/types';
import { onAuthStateChanged, type Auth } from 'firebase/auth';
import { type Database, ref as dbref, get, set } from 'firebase/database';
import { useToast } from 'primevue';
import { inject, ref, type Ref } from 'vue';
const toast = useToast()
const numberDialog = ref(false)
const messageDialog = ref(false)
const broadcastDialog = ref(false)
const message = ref('')
const bmessage = ref('')
const number = ref(1)
const items = ref([
    { id: 0, name: 'Change Number', cost: 500, description: 'Customize your player number.', action: () => numberDialog.value = true },
    { id: 1, name: 'Send Message', cost: 100, description: 'Send an anonymous message to any player.', action: () => messageDialog.value = true },
    { id: 2, name: 'Broadcast Message', cost: 1000, description: 'Send a message to all players.', action: () => broadcastDialog.value = true },
])
const db = inject('db') as Database
const auth = inject('auth') as Auth

let dbuser = useReactiveDBRef(db, dbref(db, `users/${auth.currentUser?.uid || 's'}`)) as Ref<DBUser | null>
onAuthStateChanged(auth, async () => {
    dbuser = useReactiveDBRef(db, dbref(db, `users/${auth.currentUser?.uid || 's'}`))
})

async function updateNumber() {
    numberDialog.value = false
    if (number.value < 1 || number.value > 9999) {
        toast.add({ severity: 'error', summary: 'Invalid Number', detail: 'Please enter a valid number between 1 and 9999.' })
        return
    }
    if ((dbuser.value?.credits || 0) < 500) {
        toast.add({ severity: 'error', summary: 'Insufficient Credits', detail: 'You do not have enough credits to change your number.' })
        return
    }
    const users = (await get(dbref(db, `users`))).val()
    if(users && Object.values(users).some((user: DBUser) => parseInt(user.username.replace('Player ', '')) === number.value)) {
        toast.add({ severity: 'error', summary: 'Number Taken', detail: 'This number is already taken by another player.' })
        return
    }
    await set(dbref(db, `users/${auth.currentUser?.uid}/username`), 'Player ' + number.value.toString().padStart(4, '0'))
    await set(dbref(db, `users/${auth.currentUser?.uid}/credits`), (dbuser.value?.credits || 0) - 500)
    toast.add({ severity: 'success', summary: 'Number Changed', detail: `Your number has been changed to ${number.value}.` })
}
async function sendMessage() {
    messageDialog.value = false
    if (number.value < 1 || number.value > 9999) {
        toast.add({ severity: 'error', summary: 'Invalid Number', detail: 'Please enter a valid player number.' })
        return
    }
    if ((dbuser.value?.credits || 0) < 100) {
        toast.add({ severity: 'error', summary: 'Insufficient Credits', detail: 'You do not have enough credits to send a message.' })
        return
    }
    if(!message.value.trim()) {
        toast.add({ severity: 'error', summary: 'Empty Message', detail: 'Please enter a message to send.' })
        return
    }
    const users = (await get(dbref(db, `users/`))).val()
    const user = Object.values(users).find(u => parseInt(u.username.replace('Player ', '')) === number.value)
    if (!user) {
        toast.add({ severity: 'error', summary: 'User Not Found', detail: 'Player not found.' })
        return
    }
    if(user.username === dbuser.value?.username) {
        toast.add({ severity: 'error', summary: 'Cannot Send to Yourself', detail: 'You cannot send a message to yourself.' })
        return
    }
    await set(dbref(db, `users/${user.uid}/messages`), [
        ...(user.messages || []),
        { t: Date.now(), c: message.value },
    ])
    await set(dbref(db, `users/${auth.currentUser?.uid}/credits`), (dbuser.value?.credits || 0) - 100)
    toast.add({ severity: 'success', summary: 'Message Sent', detail: `Your message has been sent to Player ${number.value}.` })
}
async function broadcastMessage() {
    broadcastDialog.value = false
    if ((dbuser.value?.credits || 0) < 1000) {
        toast.add({ severity: 'error', summary: 'Insufficient Credits', detail: 'You do not have enough credits to send a message.' })
        return
    }
    if(!bmessage.value.trim()) {
        toast.add({ severity: 'error', summary: 'Empty Message', detail: 'Please enter a message to broadcast.' })
        return
    }
    const users = (await get(dbref(db, `users`))).val()
    Object.values(users).forEach(async (user: DBUser) => {
        if(user.uid === auth.currentUser?.uid) return // Skip self
        await set(dbref(db, `users/${user.uid}/messages`), [
            ...(user.messages || []),
            { t: Date.now(), c: bmessage.value },
        ])
    })
    await set(dbref(db, `users/${auth.currentUser?.uid}/credits`), (dbuser.value?.credits || 0) - 1000)
    toast.add({ severity: 'success', summary: 'Message Sent', detail: `Your message has been broadcasted to all players.` })
}
</script>
<template>
    <Navbar />
    <Toast />
    <h1 class="text-5xl font-extrabold ml-10 my-10">Shop</h1>
    <div class="grid grid-cols-3 grid-rows-1 gap-4 mx-10">
        <Card v-for="item in items" :key="item.id" class="!bg-pink-500 !text-zinc-50">
            <template #title><span class="font-bold">{{ item.name }}</span></template>
            <template #subtitle><span class="font-medium text-zinc-50">{{ item.cost }} ₩</span></template>
            <template #content><p class="font-medium">{{ item.description }}</p></template>
            <template #footer>
                <div class="flex mt-1 gap-2 w-full">
                    <Button class="!bg-pink-700 !text-zinc-50 hover:!bg-pink-600 !border-0" :disabled="(dbuser?.credits || 0) < item.cost || !dbuser" @click="item.action()">Buy</Button>
                </div>
            </template>
        </Card>
    </div>
    <Dialog v-model:visible="numberDialog" modal header="Change number" class="w-[60vw] h-[60vh] !bg-pink-500 !border-0 modal">
        <InputNumber v-model="number" placeholder="Enter new number" class="w-full mb-4 inp-primary-n inp-n" :min="1" :max="9999" />
        <Button class="!bg-pink-700 !text-zinc-50 hover:!bg-pink-600 !border-0" @click="updateNumber()">Confirm</Button>
    </Dialog>
    <Dialog v-model:visible="messageDialog" modal header="Send Message" class="w-[60vw] h-[60vh] !bg-pink-500 !border-0 modal">
        <InputNumber v-model="number" placeholder="Player Number" class="w-full mb-4 inp-primary-n inp-n" :min="1" :max="9999" />
        <Textarea v-model="message" placeholder="Enter your message" class="w-full mb-4 inp-primary inp-n" />
        <Button class="!bg-pink-700 !text-zinc-50 hover:!bg-pink-600 !border-0" @click="sendMessage()">Send</Button>
    </Dialog>
    <Dialog v-model:visible="broadcastDialog" modal header="Broadcast Message" class="w-[60vw] h-[60vh] !bg-pink-500 !border-0 modal">
        <Textarea v-model="bmessage" placeholder="Enter your message" class="w-full mb-4 inp-primary inp-n" />
        <Button class="!bg-pink-700 !text-zinc-50 hover:!bg-pink-600 !border-0" @click="broadcastMessage()">Send</Button>
    </Dialog>
</template>