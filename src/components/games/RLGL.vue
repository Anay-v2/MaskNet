<script setup lang="ts">
import router from '@/router'
import { useReactiveDBRef } from '@/utils/dbuser'
import { games } from '@/utils/games'
import type { DBUser } from '@/utils/types'
import { onAuthStateChanged, type Auth } from 'firebase/auth'
import { type Database, ref as dbref, set } from 'firebase/database'
import { computed, inject, onMounted, reactive, ref, useTemplateRef, type Ref } from 'vue'
import Loader from '../Loader.vue'
import p1 from '@/assets/p1.png'
import p2 from '@/assets/p2.png'
import p3 from '@/assets/p3.png'
import dollf0 from '@/assets/doll/0.png'
import dollf1 from '@/assets/doll/1.png'
import dollf2 from '@/assets/doll/2.png'
import dollf3 from '@/assets/doll/3.png'
import dollf4 from '@/assets/doll/4.png'
import dollf5 from '@/assets/doll/5.png'
import dollf6 from '@/assets/doll/6.png'
import dollf7 from '@/assets/doll/7.png'
import dollf8 from '@/assets/doll/8.png'
import dollf9 from '@/assets/doll/9.png'
import dollf10 from '@/assets/doll/10.png'
import guard from '@/assets/guard.png'
import playerI from '@/assets/player/i.png'
import player0 from '@/assets/player/0.png'
import player1 from '@/assets/player/1.png'
import player2 from '@/assets/player/2.png'
import player3 from '@/assets/player/3.png'
import player4 from '@/assets/player/4.png'
import placeholder from '@/assets/placeholder_300x200.png'
import gun from '@/assets/gun.mp3'

const doll = [dollf0, dollf1, dollf2, dollf3, dollf4, dollf5, dollf6, dollf7, dollf8, dollf9, dollf10]
const playerframes = [player0, player1, player2, player3, player4]
const playerIdle = computed(() => playervel.value === 0)
const playerFrame = ref(0)
const playerFrameSrc = computed(() => playerIdle.value ? playerI : playerframes[playerFrame.value])
const started = ref(false)
const game = games[0]
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
const title = ref(game.title)
const dollf = ref(0)
const dollsrc = computed(() => doll[dollf.value])
const canshoot = computed(() => dollf.value < 6)
const alive = ref(true)
const won = ref(false)
const black = useTemplateRef('black')
const gaudio = new Audio(gun)
onMounted(async () => {
	mypl.value = { t: p1, s: p2, c: p3 }[dbuser.value?.pic || 't']
	loading.value = true
    await loadImages()
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
    started.value = true
    dollLoop()
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

async function dollLoop() {
    function rvar(mvar: number) {
        return (Math.random() - 0.5) * mvar
    }
    let backtime = 3000 + rvar(1000)
    let fronttime = 2000 + rvar(500)
    let fake = false
    // PATTERNS
    if(Math.random() < 0.1) fronttime *= 3
    if(Math.random() < 0.1) backtime *= 0.3
    if(Math.random() < 0.1) fake = true
    await turnDoll(fake)
    await new Promise(resolve => setTimeout(resolve, dollf.value === 0 ? fronttime : backtime))
    if(alive.value && !won.value) dollLoop()
}

async function turnDoll(fake: boolean = false) {
    if(!fake) {
        if(dollf.value === 0) {
            await new Promise(resolve => {
                const f = setInterval(() => {
                    dollf.value += 1
                    if (dollf.value === 6) {
                        clearInterval(f)
                        resolve(true)
                    }
                }, 100)
            })
        }
        else {
            await new Promise(resolve => {
                const f = setInterval(() => {
                    dollf.value = (dollf.value + 1) % 11
                    if (dollf.value === 0) {
                        clearInterval(f)
                        resolve(true)
                    }
                }, 100)
            })
        }
    } else {
        if(dollf.value === 0) {
            await new Promise(resolve => {
                let d = 1
                const f = setInterval(() => {
                    dollf.value += d
                    if (dollf.value === 3 && d === 1) {
                        d *= -1
                    }
                    if(dollf.value === 0 && d === -1) {
                        clearInterval(f)
                        resolve(true)
                    }
                }, 100)
            })
        }
        else {
            await new Promise(resolve => {
                let d = 1
                const f = setInterval(() => {
                    dollf.value += d
                    if (dollf.value === 8 && d === 1) {
                        d *= -1
                    }
                    if(dollf.value === 6 && d === -1) {
                        clearInterval(f)
                        resolve(true)
                    }
                }, 100)
            })
        }
    }
}

// PLAYER INPUT HANDLER
const playervel = ref(0)
const playery = ref(10)
const input = ref(false)
const playerframei = ref(0)
async function playerInput() {
    if(!alive.value || won.value) return
    if (input.value && started.value) {
        playervel.value = (playervel.value < 1000) ? playervel.value + 25 : playervel.value
    } else {
        playervel.value = (playervel.value > 0) ? playervel.value - 25 : playervel.value
    }
    playerframei.value = (playerframei.value + 0.1) % 5
    playerFrame.value = Math.floor(playerframei.value)
    playery.value += playervel.value / 2000
    if(canshoot.value && playervel.value >= 200) {
        alive.value = false
        die()
        gaudio.play()
    }
    if(playery.value > Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)*78/100) {
        won.value = true
        win()
    }
    opps.value.forEach(async opp => {
        if(opp.alive) {
            let run = false
            if (canshoot.value) {
                run = Math.random() < 0.1
                opp.stopped = false
            } else if (!opp.stopped) {
                run = Math.random() < 0.9
                if(opp.runningfor >= opp.recklessness) {
                    run = Math.random() < 0.4
                    if(!run) opp.stopped = true
                }
            }
            if (run) {
                opp.vel = (opp.vel < 1000) ? opp.vel + 25 : opp.vel
                opp.runningfor++
            } else {
                opp.vel = (opp.vel > 0) ? opp.vel - 25 : opp.vel
                opp.runningfor = 0
            }
            opp.framei = (opp.framei + 0.1) % 5
            opp.frame = Math.floor(opp.framei)
            opp.y += opp.vel / opp.speedi
            if(opp.y > Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)*78/100) {
                alive.value = false
                die()
                gaudio.play()
            }
            opp.framesrc = opp.alive ? (opp.vel <= 100 ? playerI : playerframes[opp.frame]) : placeholder
            if(canshoot.value && opp.vel >= 200) {
                opp.alive = false
                setTimeout(() => {
                    gaudio.play()
                }, Math.random() * 300)
            }
        }
    })
}
document.addEventListener('keydown', e => input.value = ['Space', 'ArrowUp', 'KeyW'].includes(e.code))
document.addEventListener('keyup', e => input.value = !['Space', 'ArrowUp', 'KeyW'].includes(e.code) && input.value)
setInterval(playerInput, 1)
const opps = ref((new Array(40).fill(ref({ x: 0, y: 0 }))).map((l, i) => (reactive({
    y: 10,
    x: i*30 + 10,
    vel: 0,
    framei: 0,
    frame: 0,
    framesrc: playerI,
    runningfor: 0,
    stopped: false,
    speedi: Math.random() * 500 + 1800,
    recklessness: Math.random() * 20 + 20,
    alive: true
}))))

async function die() {
    title.value = 'You have been eliminated'
    fade(black.value, false)
    fade(gamn.value, false)
    await new Promise(resolve => setTimeout(resolve, 4000))
    fade(gamn.value, true)
    console.log('2')
    router.push('/games')
}

async function win() {
    title.value = 'You have survived this round'
    fade(black.value, false)
    fade(gamn.value, false)
    await new Promise(resolve => setTimeout(resolve, 4000))
    fade(gamn.value, true)
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
    console.log('3')
    router.push('/games')
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = reject;
  });
}

async function loadImages() {
    Promise.all([
        loadImage(dollf0), loadImage(dollf1), loadImage(dollf2), loadImage(dollf3), loadImage(dollf4),
        loadImage(dollf5), loadImage(dollf6), loadImage(dollf7), loadImage(dollf8), loadImage(dollf9),
        loadImage(dollf10), loadImage(guard), loadImage(playerI), loadImage(player0),
        loadImage(player1), loadImage(player2), loadImage(player3), loadImage(player4),
    ])
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible" && started.value && alive.value) {
      alive.value = false
    die()
  }
})
</script>

<template>
    <audio autoplay loop><source src="@/assets/rlgl.mp3" type="audio/mp3" /></audio>
    <div class="w-screen h-screen absolute z-[499] bg-black opacity-0" ref="black"></div>
	<div class="w-screen h-screen bg-yellow-200" @keydown="playerInput">
		<Loader v-if="loading" />
		<div
			class="rounded absolute top-0 right-0 bg-cyan-500 text-zinc-50 p-4 opacity-0"
			ref="moni">
			{{ monit }}
		</div>
		<h1
			class="text-7xl font-black w-screen h-screen absolute text-center opacity-0 z-[500]"
			ref="gamn">
			{{ title }}
		</h1>
        <img :src="dollsrc" class="h-[20vh] w-[5vw] absolute left-[47.5vw] top-0">
        <img :src="guard" class="h-[10vh] w-[5vw] absolute left-[20vw] top-0">
        <img :src="guard" class="h-[10vh] w-[5vw] absolute right-[20vw] top-0">
        <div class="absolute top-[22vh] border-red-600 border-2 w-screen" />
        <img :src="playerFrameSrc" class="absolute left-[1210px] h-[10vh] z-50" :style="{ bottom: playery + 'px', opacity: alive ? 1 : 0.5 }" :class="{ 'blood': !alive }">
        <img :src="opp.framesrc" class="absolute left-[30vw] h-[10vh] z-20" :style="{ bottom: opp.y + 'px', left: opp.x + 'px', opacity: opp.alive ? 0.6 : 0.3  }" :class="{ 'blood': !opp.alive }" v-for="opp in opps">
    </div>
</template>

<style scoped>
    .blood {
        filter: brightness(0) saturate(100%) invert(25%) sepia(67%) saturate(6489%) hue-rotate(353deg) brightness(96%) contrast(115%);
    }
</style>