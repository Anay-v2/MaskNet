<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import router from '@/router';
import { ArrowRight } from 'lucide-vue-next';
</script>
<template>
  <Navbar />
  <div class="h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center text-center px-6">
    <img class="absolute w-full h-full z-0 object-cover" src="@/assets/bg1.jpg" alt="Background Image">
    <div class="absolute w-full h-full bg-black opacity-50 z-10"></div>
  <h1 class="text-7xl font-bold tracking-wide z-10" v-animateonscroll="{ enterClass: 'flicker-in-1' }">Welcome to MaskNet</h1>
  <p class="mt-4 text-2xl text-zinc-200 text-center z-10" v-animateonscroll="{ enterClass: 'flicker-in-1' }">
    The game has gone digital. Are you ready to survive the system?
  </p>
  <Button class="but-primary mt-4 z-20" size="large" @click="router.push('/auth')">
    Enter the Game
  </Button>
</div>
<div class="bg-zinc-950 py-16 text-center px-4">
  <h2 class="text-3xl font-bold mb-4" v-animateonscroll="{ enterClass: 'flicker-in-1' }">“This is not a game. It's a system.”</h2>
  <p v-animateonscroll="{ enterClass: 'flicker-in-1' }">
    Hidden beneath the surface lies a world of digital survival. No names. No mercy. Just you, the game, and the clock.
  </p>
  <Button size="large" class="but-primary mt-16" @click="router.push('/about')">
    Discover the Lore <ArrowRight />
  </Button>
</div>
<div class="bg-zinc-950 py-16 px-6">
  <h2 class="text-5xl text-center font-bold mb-10" v-animateonscroll="{ enterClass: 'flicker-in-1' }">Features</h2>
  <div class="grid grid-cols-3 gap-6 mx-auto">
    <div class="bg-pink-600 p-6 rounded-xl shadow-md" v-animateonscroll="{ enterClass: 'flicker-in-1' }">
      <h3 class="text-xl font-semibold mb-2">Secret Messaging</h3>
      <p>Communicate with allies — or deceive them. Messages self-destruct. Mostly.</p>
    </div>
    <div class="bg-pink-600 p-6 rounded-xl shadow-md" v-animateonscroll="{ enterClass: 'flicker-in-1' }">
      <h3 class="text-xl font-semibold mb-2">Credits Market</h3>
      <p>Spend your hard-earned credits to buy favors, forge tools, or maybe… bend the rules. Every purchase has a price.</p>
    </div>
    <div class="bg-pink-600 p-6 rounded-xl shadow-md" v-animateonscroll="{ enterClass: 'flicker-in-1' }">
      <h3 class="text-xl font-semibold mb-2">Player Leaderboard</h3>
      <p>Track health, credits, status. Everything that decides your survival.</p>
    </div>
  </div>
</div>
<div class="bg-zinc-950 py-20 text-center text-white px-6">
  <h2 class="text-3xl font-bold mb-4" v-animateonscroll="{ enterClass: 'flicker-in-1' }">Your number is waiting.</h2>
  <p class="text-zinc-400 mb-6" v-animateonscroll="{ enterClass: 'flicker-in-1' }">Sign up to get your Player ID and face the trials of MaskNet.</p>
  <Button class="but-primary" size="large" @click="router.push('/auth')">
    Begin Your Trial
  </Button>
</div>
</template>