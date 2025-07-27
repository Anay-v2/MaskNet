<script setup lang="ts">
import { useRoute } from 'vue-router';
import { games } from '@/utils/games';
import Marbles from '@/components/games/Marbles.vue';
import RLGL from '@/components/games/RLGL.vue';
import TugOfWar from '@/components/games/TugOfWar.vue';
import router from '@/router';

const route = useRoute();
const game = games.find(g => g.id === Number(route.params.id));
const comps = { 0: RLGL,  2: Marbles, 4: TugOfWar }
if(!game) router.push('/games')
</script>
<template>
    <component :is="comps[game.id]" />
</template>