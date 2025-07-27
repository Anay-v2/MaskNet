<script setup lang="ts">
import router from '@/router'
import { useReactiveDBRef } from '@/utils/dbuser'
import { games } from '@/utils/games'
import type { DBUser } from '@/utils/types'
import { onAuthStateChanged, type Auth } from 'firebase/auth'
import { type Database, ref as dbref, set } from 'firebase/database'
import { computed, inject, onMounted, ref, useTemplateRef, type Ref } from 'vue'
import Loader from '../Loader.vue'
import p1 from '@/assets/p1.png'
import p2 from '@/assets/p2.png'
import p3 from '@/assets/p3.png'

const game = games.find(g => g.id === 4)
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
const t1players = ref(
	new Array(10).fill(0).map(_ => Math.floor(Math.random() * 3) + 1)
)
const t2players = ref(
	new Array(10).fill(0).map(_ => Math.floor(Math.random() * 3) + 1)
)
const rl = ref(0)
const started = ref(false)
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
            if(m < 0) m = 0
			monit.value = m + ' ₩'
			if (m === (dbuser.value?.credits || 0) - game.cost) {
				clearInterval(l)
				resolve(true)
			}
		}, 10)
	})
	if (moni.value) await fade(moni.value, true)
	await set(
		dbref(db, `users/${auth.currentUser?.uid}/credits`),
		Math.max((dbuser.value?.credits || 0) - game.cost, 0)
	)
	startGame()
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

function startGame() {
	const f = setInterval(async () => {
		started.value = true
		rl.value +=
			(-t2players.value.length + (t1players.value.length - 1) * 0.6) *
			0.01
		if (keyPressed.value) rl.value += 0.075
		if (rl.value <= -2 - 4 * (10 - t1players.value.length)) {
			const h = t1players.value.pop() as number
			doDeath(h, 90 - t1players.value.length * 4 + rl.value)
		}
		if (rl.value >= +3 + 4 * (10 - t2players.value.length)) {
			const h = t2players.value.pop() as number
			doDeath(h, 5 + t2players.value.length * 4 + rl.value, true)
		}
		if (t1players.value.length === 0 || t2players.value.length === 0) {
			clearInterval(f)
			rl.value = 0
			started.value = false
			title.value = t1players.value.length === 0 ? 'You Lost' : 'You Won'
			fade(gamn.value as HTMLElement, false)
			await new Promise(resolve => setTimeout(resolve, 2000))
			fade(gamn.value as HTMLElement, true)
            if(t2players.value.length === 0) {
			    let m = (dbuser.value?.credits || 0)
			    monit.value = m + ' ₩'
			    if (moni.value) await fade(moni.value, false)
                await new Promise(resolve => {
                    const l = setInterval(() => {
                        m++
                        monit.value = m + ' ₩'
                        if (m === (dbuser.value?.credits || 0) + game.gain) {
                            clearInterval(l)
                            resolve(true)
                        }
                    }, 10)
                })
                if (moni.value) await fade(moni.value, true)
                await set(
                    dbref(db, `users/${auth.currentUser?.uid}/credits`),
                    (dbuser.value?.credits || 0) + game.gain
                )
            }
			router.push('/games')
		}
	}, 1)
}

async function doDeath(player: number, right: number, i: boolean = false) {
	if (!started.value) return
	const h = document.createElement('img')
	h.src = [p1, p2, p3][player - 1]
	h.className = 'absolute w-[4vw] z-[499]' + (i ? ' -scale-x-100' : '')
	h.style.right = `${right}vw`
	h.style.bottom = `24vh`
	let b = 24
	document.getElementById('game-container')?.appendChild(h)
	const f = setInterval(() => {
		b -= 0.8
		h.style.bottom = `${b}vh`
		if (b <= 2) {
			document.getElementById('game-container')?.removeChild(h)
			clearInterval(f)
		}
	}, 10)
}

window.addEventListener('keydown', e => {
	if (e.code !== 'Space' || timeout.value > 0) return
	keyPressed.value = !keyPressed.value
	if (!keyPressed.value) {
		timeout.value += 100
		const l = setInterval(() => {
			timeout.value -= 1
			if (timeout.value === 0) {
				clearInterval(l)
			}
		}, 1)
	}
})

window.addEventListener('keyup', e => {
	if (e.code !== 'Space') return
	keyPressed.value = false
})
const keyPressed = ref(false)
const timeout = ref(0)
</script>
<template>
	<audio autoplay loop><source src="@/assets/o.mp3" type="audio/mp3" /></audio>
	<div
		class="w-screen h-screen bg-zinc-950 overflow-hidden"
		id="game-container">
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
		<h1 class="text-5xl font-extrabold absolute left-[5vw] top-[5vh]">
			My Team
		</h1>
		<h1 class="text-5xl font-extrabold absolute right-[5vw] top-[5vh]">
			Enemy Team
		</h1>
		<h1
			class="text-5xl font-extrabold absolute w-screen text-center bottom-[2vh]">
			Press Space to Pull
		</h1>
		<div
			v-for="(p, i) in t1players"
			:key="i"
			class="absolute bottom-[24vh] w-[4vw] z-[499]"
			:style="{ right: `${90 - i * 4 + rl}vw` }">
			<img
				:src="[p1, p2, p3][p - 1]"
				class="w-[4vw]" />
		</div>
		<div
			v-for="(p, i) in t2players"
			:key="i"
			class="absolute bottom-[24vh] w-[4vw] z-[499] -scale-x-100"
			:style="{ right: `${5 + i * 4 + rl}vw` }">
			<img
				:src="[p1, p2, p3][p - 1]"
				class="w-[4vw]" />
		</div>
		<div
			class="absolute bottom-[30vh] w-[90vw] bg-amber-950 h-[1vh]"
			:style="{ right: `${5 + rl}vw` }"></div>
		<div
			class="absolute bottom-[20vh] left-0 w-[45vw] h-[5vh] bg-yellow-400"></div>
		<div
			class="absolute bottom-[20vh] right-0 w-[45vw] h-[5vh] bg-yellow-400"></div>
	</div>
</template>
