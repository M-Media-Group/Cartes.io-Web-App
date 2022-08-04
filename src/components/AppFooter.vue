<script setup lang="ts">
const url = import.meta.env.VITE_API_URL;
</script>
<template>
    <div>This is an alpha version of Cartes.io 2 point O. View the original full app <a :href="url">here</a>
    </div>
</template>
<style scoped>
div {
    margin-bottom: var(--block-spacing-vertical);
    margin-top: var(--block-spacing-vertical);
}
</style>