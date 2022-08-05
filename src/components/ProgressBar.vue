<template>
    <progress v-if="state.active"
        :value="value"
        max="100"></progress>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useProgress } from '@marcoschulte/vue3-progress';

import trickleComposable from '@/composables/trickleComposable';

export default defineComponent({
    name: 'Vue3ProgressBar',

    setup: () => {
        const state = useProgress().state();
        const { value } = trickleComposable(state);
        return { state, value };
    },

    computed: {
        style() {
            return {
                transform: `translate3d(${this.value - 100}%,0,0)`,
            };
        },
    },

});
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
