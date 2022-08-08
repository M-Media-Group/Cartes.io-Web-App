
<script setup lang="ts">
defineProps({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: false,
    }
})
</script>
<template>
    <section>
        <BaseHeading as="h2"
            :title="title"
            :subtitle="subtitle" />

        <slot />

    </section>
</template>