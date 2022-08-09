<script setup lang="ts">
import { computed, defineAsyncComponent, ref, render } from 'vue';

const props = defineProps({
    icon: {
        type: String,
        required: true,
    },
})

const iconC = defineAsyncComponent(
    () => import(`./${props.icon}.vue`),
)

</script>

<template>
    <iconC />
</template>