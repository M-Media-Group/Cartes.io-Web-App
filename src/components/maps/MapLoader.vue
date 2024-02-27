<template>
    <div class="loader">
    </div>
</template>
<style scoped>
.loader {
    height: 100%;
    animation: 1.5s shine linear infinite;
    background: var(--pico-background-color);
    background: linear-gradient(110deg, var(--pico-background-color) 8%, var(--pico-card-background-color) 18%, var(--pico-background-color) 33%);
    background-size: 200% 100%;
}

/* Loader keyframes card loading */
@keyframes shine {
    to {
        background-position-x: -200%;
    }
}
</style>