<script setup lang="ts">
const url = import.meta.env.VITE_API_URL;
</script>
<template>
    <div>This is a beta version of Cartes.io v2
    </div>
    <hr />
    <div class="grid">
        <a href="https://cartes.io/terms-and-conditions"
            target="_blank">Terms and conditions</a>
        <a href="https://cartes.io/privacy-policy"
            target="_blank">Privacy policy</a>
        <hr />
        <a href="https://github.com/M-Media-Group/Cartes.io/wiki/API"
            target="_blank">API docs</a>
        <a href="https://github.com/M-Media-Group/Cartes.io"
            target="_blank">Github</a>
    </div>
</template>
<style scoped>
div {
    margin-bottom: var(--block-spacing-vertical);
    margin-top: var(--block-spacing-vertical);
}
</style>