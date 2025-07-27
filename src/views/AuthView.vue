<script setup lang="ts">
    import { computed, inject, ref } from 'vue';
    import {
        createUserWithEmailAndPassword,
        GoogleAuthProvider,
        sendEmailVerification,
        sendPasswordResetEmail,
        signInWithEmailAndPassword,
        signInWithPopup,
        updateProfile,
        type Auth,
    } from '@firebase/auth'
    import { Database, ref as dbref, get, set } from '@firebase/database'
import router from '@/router';
import { useToast } from 'primevue'
import Loader from '@/components/Loader.vue'
import { ArrowLeft } from 'lucide-vue-next';

const toast = useToast()
const loading = ref(false)
    const pg = ref(0); // 0: Login, 1: Sign Up, 2: Verify Email, 3: Reset Password
    const db = inject('db') as Database
    const auth = inject('auth') as Auth
	const google = ref(false)
    const email = ref('')
    const uname = ref('')
    const emailInputInputted = ref(false)
    const emailInvalid = computed(() =>
        !email.value.match(
            /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
        )
    )
    const pass = ref('')
    const passInputInputted = ref(false)
    const passInvalid = computed(
        () =>
            !(
                pass.value.length >= 8 &&
                pass.value.match(/[a-z]/g) &&
                pass.value.match(/[A-Z]/g) &&
                pass.value.match(/[0-9]/g)
            )
    )
    const passInvalidText = computed(() => {
        if (pass.value.length < 8) return 'Your access code must be at least 8 digits long.'
        if (!pass.value.match(/[a-z]/g)) return 'Lowercase character required to bypass level-1 scan.'
        if (!pass.value.match(/[A-Z]/g)) return 'Uppercase character required for clearance.'
        if (!pass.value.match(/[0-9]/g)) return 'Insert at least one number to complete sequence.'
        return ''
    })

    const provider = new GoogleAuthProvider()

    async function signUp() {
	if (!auth) return
	loading.value = true
	try {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email.value,
			pass.value
		)
		const user = userCredential.user
        uname.value = `Player ${Math.floor(1000 + Math.random() * 9000)}`
		await updateProfile(user, {
			displayName: uname.value,
		})
		await set(dbref(db, `users/${user.uid}`), {
			username: uname.value,
			uid: user.uid,
			pic: ['s', 'c', 't'][Math.floor(Math.random() * 3)],
			credits: 500
		})
		signUpSequence()
	} catch(e) {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: e,
			life: 5000
		})
	} finally {
		loading.value = false
	}
}

async function logIn() {
	if (!auth) return
	try {
		loading.value = true
		await signInWithEmailAndPassword(auth, email.value, pass.value)
		router.push('/')
	} catch(e) {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: e,
			life: 5000
		})
	} finally {
		loading.value = false
	}
}

async function signInGoogle() {
	if (!auth) return
	try {
		loading.value = true
		const userCredential = await signInWithPopup(auth, provider)
		const user = userCredential.user
        uname.value = `Player ${Math.floor(1000 + Math.random() * 9000)}`
		await updateProfile(user, {
			// @ts-ignore
			displayName: uname.value,
		})
		if(!(await get(dbref(db, `users/${user.uid}`))).val()) {
			await set(dbref(db, `users/${user.uid}`), {
				// @ts-ignore
				username: uname.value,
				uid: user.uid,
				pic: ['s', 'c', 't'][Math.floor(Math.random() * 3)],
				credits: 500
			})
			google.value = true
			signUpSequence()
		}
		else router.push('/')
	} catch(e) {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: e,
			life: 5000
		})
	} finally {
		loading.value = false
	}
}

function signUpSequence() {
	if(!auth.currentUser) return
	pg.value = 2
	toast.add({
		severity: 'success',
		summary: 'Signed Up',
		detail: `Access granted. Welcome to the Game.`,
		life: 5000
	})
	if(!google.value) sendEmailVerification(auth.currentUser)
}

async function forgotPass() {
	if (!auth) return
	try {
		loading.value = true
		await sendPasswordResetEmail(auth, email.value)
		toast.add({
			severity: 'success',
			summary: 'Email sent',
			detail: 'Recovery instructions dispatched. Check your terminal inbox.',
			life: 5000,
		})
		pg.value = 0
	} catch(e) {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: e,
			life: 5000
		})
	} finally {
		loading.value = false
	}
}
</script>
<template>
    <Toast />
	<Loader v-if="loading" />
    <div class="w-screen h-screen grid place-items-center overflow-hidden">
        <div class="h-[80vh] w-[60vw] bg-pink-500 rounded-md p-6 backdrop-blur-md grid place-items-center relative">
			<Button class="!absolute top-2 left-4 not-hover:!bg-pink-500 !border-0 !text-white hover:!bg-pink-400" rounded @click="router.back()"><ArrowLeft /></Button>
            <h1 class="text-3xl font-extrabold mb-4">{{ [`Enter the Game`, `Join the Arena`, `Player Registered`, `Regain Access`][pg] }}</h1>
			<h2 class="text-2xl font-extrabold mb-4" v-if="pg === 2">Identity assigned: {{ uname }}. You're now in the system.</h2>
			<h3 class="text-lg font-bold mb-4" v-if="pg === 2 && !google">Verify your inbox. Only confirmed identities proceed.</h3>
            <InputText :class="{invalid: emailInvalid && emailInputInputted}" @input="emailInputInputted = true" v-if="pg < 2 || pg === 3" type="email" size="large" class="inp-primary mb-4 w-full" placeholder="Enter Email" v-model="email" />
            <InputText :class="{invalid: passInvalid && passInputInputted }" @input="passInputInputted = true" v-if="pg < 2" type="password" size="large" class="inp-primary w-full" placeholder="Enter Access Code" v-model="pass" />
            <a v-if="pg < 2" class="text-cyan-400 w-full text-right underline cursor-pointer" @click="pg = 3">Forgot Access Code?</a>
            <p v-if="passInvalid && passInputInputted && pg < 2" class="text-red-700 mb-4">{{ passInvalidText }}</p>
            <Button class="but-primary w-full" v-if="pg === 0" @click="logIn()">Log In</Button>
            <Button class="but-primary w-full" v-if="pg === 1" @click="signUp()">Sign Up</Button>
            <Button class="but-primary w-full" v-if="pg === 3" @click="forgotPass()">Reset Access Code</Button>
            <a href="https://mail.google.com" target="_blank" v-if="pg === 2 && !google" class="w-full"><Button class="but-primary w-full">Access Terminal Inbox</Button></a>
			<Button class="but-primary w-full" @click="router.push('/')" v-if="pg === 2">Enter Control Room</Button>
            <Button class="!bg-white hover:!bg-white focus:!bg-white w-full !text-zinc-950" @click="signInGoogle()" v-if="pg < 2"><img src="@/assets/google.png" class="w-6 h-6">Link External Identity</Button>
            <p v-if="pg === 0">New here? <span class="text-cyan-400 underline cursor-pointer" @click="pg = 1">Enlist now</span>.</p>
            <p v-if="pg === 1">Returning player? <span class="text-cyan-400 underline cursor-pointer" @click="pg = 0">Re-enter</span>.</p>
        </div>
		<img src="@/assets/doll.png" class="absolute bottom-[5vw] -right-[5vw] w-[30vw] h-[60vh]">
		<img src="@/assets/masked_man.png" class="absolute bottom-[5vw] left-[5vw] w-[10vw] h-[60vh]">
    </div>
</template>