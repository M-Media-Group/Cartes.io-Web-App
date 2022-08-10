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
        v-if="subtitle || $slots.subtitle">
        <component :is="as">{{ title }}</component>
        <slot name="subtitle">
            <p>{{ subtitle }}</p>
        </slot>

    </div>
    <component v-else
        :is="as">{{ title }}</component>
</template>