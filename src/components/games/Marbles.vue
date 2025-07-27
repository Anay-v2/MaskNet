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

const game = games[2]
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
const mypl = ref(p1)
const opppl = ref(p2)
const oppus = ref(0)
const mymar = ref(10)
const oppmar = ref(10)
const title = ref(game.title)
const roundno = ref(1)
const hol: Ref<null | boolean> = ref(null)
const roundinp = ref(false)
const held: Ref<null | number> = ref(null)
const holdinp = ref(1)
const heldf = ref(false)
const betinp = ref(1)
const betno: Ref<null | number> = ref(null)
const betev: Ref<null | boolean> = ref(null)
const minbet = ref(1)
const maxbet = computed(() => Math.min(10, mymar.value, oppmar.value))
onMounted(async () => {

	mypl.value = { t: p1, s: p2, c: p3 }[dbuser.value?.pic || 't']
	opppl.value = { t: [p2, p3], s: [p1, p3], c: [p1, p2] }[
		dbuser.value?.pic || 't'
	][Math.floor(Math.random() * 2)]
	oppus.value = Math.floor(Math.random() * 10_000)
	loading.value = true
	await new Promise(resolve => setTimeout(resolve, 2000))
	loading.value = false
	let m = dbuser.value?.credits || 0
	monit.value = m + ' ₩'
	if (moni.value) await fade(moni.value, false)
	await new Promise(resolve => {
		const l = setInterval(() => {
			m--
			if (m < 0) m = 0
			monit.value = m + ' ₩'
			if (m === (dbuser.value?.credits || 0) - game.cost) {
				clearInterval(l)
				resolve(true)
			}
		}, 10)
	})
	if (moni.value) await fade(moni.value, true)
	console.log('h')
	await set(
		dbref(db, `users/${auth.currentUser?.uid}/credits`),
		Math.max((dbuser.value?.credits || 0) - game.cost, 0)
	)
	gameLoop()
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

async function gameLoop() {
	if (!gamn.value) return
	title.value = `Cycle ${roundno.value}`
	await fade(gamn.value, false)
	await new Promise(resolve => setTimeout(resolve, 1000))
	await fade(gamn.value, true)
	if (hol.value === null) hol.value = Math.random() < 0.5
	else hol.value = !hol.value
	title.value = `The marbles are in ${
		hol.value ? dbuser.value?.username : 'Player ' + oppus.value
	}'s hands`
	await fade(gamn.value, false)
	await new Promise(resolve => setTimeout(resolve, 1000))
	await fade(gamn.value, true)
	await doRound()
	await gameLoop()
}

async function doRound() {
	roundinp.value = true
	let gain = 0
	if (hol.value) {
		held.value = null
		heldf.value = false
		let bet = 0
		if (oppmar.value <= 2) bet = 1
		else if (oppmar.value - mymar.value >= 5)
			bet = Math.min(3, Math.floor(oppmar.value * 0.3))
		else if (oppmar.value - mymar.value <= -3)
			bet = Math.min(Math.floor(oppmar.value * 0.4), mymar.value)
		else bet = Math.min(2, Math.floor(oppmar.value * 0.25))
		bet = Math.max(1, Math.min(bet, oppmar.value, mymar.value))
		let ev = Math.random() < 0.5
		await new Promise(resolve =>
			setInterval(() => {
				if (heldf.value) resolve(true)
			}, 1)
		)
		roundinp.value = false
		title.value = `Player ${oppus.value} wagers ${bet} marbles on ${
			ev ? 'even' : 'odd'
		}`
		gain = (held.value % 2 === (ev ? 0 : 1) ? -bet : bet) || 0
	} else {
		if (oppmar.value <= 2)
			held.value = Math.floor(Math.random() * 3) + 1 // 1-3
		else if (oppmar.value - mymar.value >= 5)
			held.value = Math.floor(Math.random() * 5) + 1 // 1-5
		else held.value = Math.floor(Math.random() * 8) + 1
		held.value = Math.max(
			1,
			Math.min(held.value, oppmar.value, mymar.value)
		)
		betno.value = null
		betev.value = null
		await new Promise(resolve =>
			setInterval(() => {
				if (betno.value && betev.value !== null) resolve(true)
			}, 1)
		)
		roundinp.value = false
		title.value = `Player ${oppus.value} is holding ${held.value} marbles`
		gain =
			(held.value % 2 === (betev.value ? 0 : 1)
				? betno.value
				: -betno.value) || 0
	}
	await fade(gamn.value, false)
	await new Promise(resolve => setTimeout(resolve, 1000))
	await fade(gamn.value, true)
	mymar.value += gain
	oppmar.value -= gain
	if (mymar.value > 0 && oppmar.value > 0) {
		title.value = `${dbuser.value?.username} ${
			gain > 0 ? 'acquired' : 'lost'
		} ${Math.abs(gain)} marbles`
		await fade(gamn.value, false)
		await new Promise(resolve => setTimeout(resolve, 1000))
		await fade(gamn.value, true)
		roundno.value++
	} else {
		title.value = `${dbuser.value?.username} has ${
			mymar.value > 0 ? 'survived this round' : 'been eliminated'
		}`
		await fade(gamn.value, false)
		await new Promise(resolve => setTimeout(resolve, 1000))
		await fade(gamn.value, true)
		if (mymar.value > 0) {
			let m = dbuser.value?.credits || 0
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
		await new Promise(resolve => null)
	}
}

function updateBet(ev?: boolean) {
	betno.value = betinp.value
	if (ev !== undefined && ev !== null) betev.value = ev
}

function updateHold() {
	if (
		holdinp.value < 1 ||
		holdinp.value > mymar.value ||
		Math.floor(holdinp.value) !== holdinp.value
	)
		return
	held.value = holdinp.value
	heldf.value = true
}
</script>
<template>
	<audio autoplay loop><source src="@/assets/o.mp3" type="audio/mp3" /></audio>
	<div class="w-screen h-screen bg-pink-500">
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
		<div class="absolute left-[20vw] top-[40vh] grid place-items-center">
			<img
				class="w-[5vw] h-[10vh]"
				:src="mypl" />
			<Badge
				class="!text-zinc-50 !bg-pink-600 text-sm"
				:value="dbuser?.username" />
		</div>
		<div class="absolute right-[20vw] top-[40vh] grid place-items-center">
			<img
				class="w-[5vw] h-[10vh] -scale-x-100"
				:src="opppl" />
			<Badge
				class="!text-zinc-50 !bg-pink-600 text-sm"
				:value="`Player ${oppus}`" />
		</div>
		<div
			class="absolute bottom-0 left-0 w-screen h-[20vh] bg-cyan-500 flex items-center"
			v-if="roundinp">
			<div class="w-[50vw] border-r-2 border-zinc-50 h-full">
				<div
					class="w-[50vw] text-xl border-b-2 border-zinc-50 flex items-center justify-center h-[25%]">
					{{ dbuser?.username }}
				</div>
				<div class="flex items-center justify-center w-[50vw] h-[75%]">
					<div
						class="mx-4 border-r-2 border-zinc-50 h-full flex flex-col justify-center items-center w-[20%]">
						<h2 class="text-xl">{{ mymar }} Marbles</h2>
						<h3 class="text-lg">
							{{ hol ? 'Holding' : 'Guessing' }}
						</h3>
					</div>
					<div
						class="flex items-center h-full w-[80%] px-1"
						v-if="!hol">
						<InputNumber
							class="inp-primary-n inp-n mx-0 !w-1/3"
							id="jamala1"
							placeholder="Wager"
							:max="maxbet"
							:min="minbet"
							@input="updateBet()"
							v-model="betinp" />
						<Button
							class="but-primary w-1/3"
							@click="updateBet(true)"
							:disabled="
								betinp < minbet ||
								betinp > maxbet ||
								Math.floor(betinp) !== betinp
							"
							>Wager Even</Button
						>
						<Button
							class="but-primary w-1/3"
							@click="updateBet(false)"
							:disabled="
								betinp < minbet ||
								betinp > maxbet ||
								Math.floor(betinp) !== betinp
							"
							>Wager Odd</Button
						>
					</div>
					<div
						class="flex items-center h-full w-[80%] px-1"
						v-else>
						<InputNumber
							class="inp-primary-n inp-n mx-0 !w-1/2"
							id="jamala2"
							placeholder="Marbles"
							:max="maxbet"
							:min="minbet"
							v-model="holdinp" />
						<Button
							class="but-primary w-1/2"
							@click="updateHold()"
							:disabled="
								holdinp < 1 ||
								holdinp > mymar ||
								Math.floor(holdinp) !== holdinp
							"
							>Hold</Button
						>
					</div>
				</div>
			</div>
			<div class="w-[50vw] border-zinc-50 h-full">
				<div
					class="w-[50vw] text-xl border-b-2 border-zinc-50 flex items-center justify-center h-[25%]">
					Player {{ oppus }}
				</div>
				<div
					class="flex flex-col items-center justify-center w-[50vw] h-[75%]">
					<h2 class="text-xl">{{ oppmar }} Marbles</h2>
					<h3 class="text-lg">{{ !hol ? 'Holding' : 'Guessing' }}</h3>
				</div>
			</div>
		</div>
	</div>
</template>
