<template>
    <progress v-if="state.active"
        :value="value"
        max="100"></progress>
</template>

<script setup lang="ts">
import { useProgress } from '@marcoschulte/vue3-progress';
import trickleComposable from '@/composables/trickleComposable';

const state = useProgress().state();
const { value } = trickleComposable(state);
</script>

<style scoped>
progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}
</style>
