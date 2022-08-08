<script setup lang="ts">
defineProps({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: false,
    },
    as: {
        type: String,
        default: "h1"
    },
})
</script>
<template>
    <div class="headings"
        v-if="subtitle">
        <component :is="as">{{ title }}</component>
        <p>{{ subtitle }}</p>
    </div>
    <component v-else
        :is="as">{{ title }}</component>
</template>