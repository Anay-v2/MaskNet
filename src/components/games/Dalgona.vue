<script setup lang="ts">
import { useReactiveDBRef } from '@/utils/dbuser'
import { games } from '@/utils/games'
import type { DBUser } from '@/utils/types'
import { type Auth, onAuthStateChanged } from 'firebase/auth'
import { type Database, ref as dbref, set } from 'firebase/database'
import { computed, inject, onMounted, ref, useTemplateRef, type Ref } from 'vue'
import Loader from '@/components/Loader.vue'

    const started = ref(false)
const game = games[1]
const auth = inject('auth') as Auth
const db = inject('db') as Database
let dbuser = useReactiveDBRef(
    db,
	dbref(db, `users/${auth.currentUser?.uid || 's'}`)
) as Ref<DBUser | null>
onAuthStateChanged(auth, async () => {
	dbuser = useReactiveDBRef(
		db,
		dbref(db, `users/${auth.currentUser?.uid || 's'}`)
	)
})
///// OPENING SEQUENCE
const moni = useTemplateRef('moni')
const gamn = useTemplateRef('gamn')
const monit = ref('')
const loading = ref(false)
const title = ref(game.title)
onMounted(async () => {
	loading.value = true
	await new Promise(resolve => setTimeout(resolve, 2000))
	loading.value = false
	let m = dbuser.value?.credits || 0
	monit.value = m + ' ₩'
	if (moni.value) await fade(moni.value, false)
	await new Promise(resolve => {
		const l = setInterval(() => {
			m--
			monit.value = m + ' ₩'
			if (m === (dbuser.value?.credits || 0) - game.cost) {
				clearInterval(l)
				resolve(true)
			}
		}, 10)
	})
	if (moni.value) await fade(moni.value, true)
	// await set(
	// 	dbref(db, `users/${auth.currentUser?.uid}/credits`),
	// 	(dbuser.value?.credits || 0) - game.cost
	// )
    started.value = true
})
///// FADE FUNCTION
function fade(el: HTMLElement, out: boolean = true) {
    let o = out ? 1 : 0
	return new Promise(resolve => {
		const f = setInterval(() => {
			o += out ? -0.01 : 0.01
			el.style.setProperty('opacity', o.toString())
			if (o <= 0 || o >= 1) {
                resolve(true)
				clearInterval(f)
			}
		}, 5)
	})
}
const pixels: Ref<{ x: number; y: number }[]> = ref([])
const canv = useTemplateRef('canv')
const pressed = ref(false)
setInterval(() => {
    if(!pressed.value || !started.value) return
    const pos = canv.value?.getNode().getPointerPosition()
    if (pos) {
        pixels.value.push({
            x: pos.x,
            y: pos.y
        })
    }
}, 10)

document.addEventListener('mousedown', () => {
    pressed.value = true
})
document.addEventListener('mouseup', () => {
    pressed.value = false
})
</script>

<template>
    <div class="w-screen h-screen bg-pink-500 grid place-items-center">
		<Loader v-if="loading" />
		<div
			class="rounded absolute top-0 right-0 bg-cyan-500 text-zinc-50 p-4 opacity-0 z-[501]"
			ref="moni">
			{{ monit }}
		</div>
		<h1
			class="text-7xl font-black w-screen h-screen absolute text-center opacity-0"
			ref="gamn">
			{{ title }}
		</h1>
        <v-stage :config="{ width: 300, height: 300 }" v-if="started" ref="canv">
            <v-layer>
                <v-circle
                :config="{
                        x: 150,
                        y: 150,
                        radius: 140,
                        fill: '#D4A574',
                        stroke: '#8B4513',
                        strokeWidth: 2
                    }"
                    />
                    <v-circle v-for="pixel in pixels"
                        :config="{
                            x: pixel.x,
                            y: pixel.y,
                            radius: 5,
                            fill: '#8B4513',
                            stroke: '#8B4513',
                        }"
                    />
            </v-layer>
        </v-stage>
    </div>
</template>