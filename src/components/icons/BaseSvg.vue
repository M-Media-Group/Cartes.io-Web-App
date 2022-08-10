<script setup lang="ts">
import { computed, defineAsyncComponent, ref, render } from 'vue';

const props = defineProps({
    icon: {
        type: String,
        required: true,
    },
})

// @todo - see https://github.com/vitejs/vite/issues/1265, currently just using GPS since its the only icon we use
const iconC = defineAsyncComponent(() =>
    import('@/components/icons/gps.vue')
)

</script>

<template>
    <iconC />
</template>