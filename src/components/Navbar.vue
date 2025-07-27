<script setup lang="ts">
    import router from '@/router';
import { useReactiveDBRef } from '@/utils/dbuser';
import type { DBUser } from '@/utils/types';
import { onAuthStateChanged, signOut, type Auth } from 'firebase/auth';
import { type Database, ref as dbref } from 'firebase/database';
import { ArrowRight, LogOut, MessageCircle } from 'lucide-vue-next';
import { inject, ref, useTemplateRef, type Ref } from 'vue'
import mask_t from '@/assets/mask_triangle.png'
import mask_c from '@/assets/mask_circle.png'
import mask_s from '@/assets/mask_square.png'

	const profilePopover = useTemplateRef('profilePopover')
    const items = ref([
        {
            label: 'Home',
            locn: '/'
        },
		{
			label: 'Games',
			locn: '/games'
		},
		{
			label: 'Shop',
			locn: '/shop'
		},
		{
			label: 'Leaderboard',
			locn: '/leaderboard'
		},
        {
            label: 'About',
            locn: '/about'
        },
    ])
	const auth = inject('auth') as Auth
	const db = inject('db') as Database
	let dbuser = useReactiveDBRef(db, dbref(db, `users/${auth.currentUser?.uid || 's'}`)) as Ref<DBUser | null>
	onAuthStateChanged(auth, async () => {
		dbuser = useReactiveDBRef(db, dbref(db, `users/${auth.currentUser?.uid || 's'}`))
	})
	const logoutMenu = ref([
	{
		label: 'Messages',
		icon: MessageCircle,
		action: () => router.push('/messages')
	},
	{
		label: 'Logout',
		icon: LogOut,
		action: logOut
	},
])

function logOut() {
	if(auth) signOut(auth)
	router.push('/')
}
</script>

<template>
	<Menubar :model="items" class="!bg-pink-500 !border-pink-600">
		<template #start>
			<h1 class="text-2xl font-extrabold">MaskNet</h1>
		</template>
		<template #item="{ item, props }">
			<Button class="not-hover:!bg-pink-500 !border-0 !text-zinc-50 hover:!bg-pink-400 font-medium" @click="router.push(item.locn)">
                <component :is="item.icon" class="mr-2" v-if="item.icon" />
				<span>{{ item.label }}</span>
			</Button>
		</template>
		<template #end>
			<div class="flex items-center gap-2">
				<Button class="not-hover:!bg-pink-500 !border-0 !text-zinc-50 hover:!bg-pink-400 font-medium" @click="router.push('/auth')" v-if="!dbuser">
					Sign in <ArrowRight />
				</Button>
				<Button class="not-hover:!bg-pink-500 !border-0 !text-zinc-50 hover:!bg-pink-400 font-medium" v-if="dbuser" @click="profilePopover?.toggle">
					<Badge class="!text-zinc-50 !bg-pink-600" :value="dbuser.credits + '₩'"></Badge>
					<span class="mr-2">{{ dbuser.username }}</span>
					<Avatar shape="circle" :image="{ t: mask_t, c: mask_c, s: mask_s }[dbuser.pic]" />
				</Button>
				<Menu ref="profilePopover" :popup="true" :model="logoutMenu" class="!bg-pink-500 !border-pink-600 menu-primary">
					<template #item="{ item, props }">
						<Button class="not-hover:!bg-pink-500 !border-0 !text-zinc-50 hover:!bg-pink-400 font-medium w-full flex !justify-start items-center" @click="item.action()">
							<component :is="item.icon" class="w-4 h-4" />
                    		<span>{{ item.label }}</span>
						</Button>
					</template>
				</Menu>
			</div>
		</template>
	</Menubar>
</template>
