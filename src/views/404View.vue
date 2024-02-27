
<script setup lang="ts">

import AppLayout from "@/templates/AppLayout.vue";
import { ref } from "vue";


</script>

<template>
    <AppLayout>
        <template #header>
            <div class="header">
                <div class="container">
                    <BaseHeading title="Page not found"
                        subtitle="The page you're looking for isn't here." />
                    <BaseButton to="/">Explore all maps</BaseButton>
                </div>
            </div>
        </template>
    </AppLayout>
</template>
<style scoped>
.header {
    height: 60vh;
    background-color: var(--pico-background-color);
    /* background: linear-gradient(var(--pico-card-border-color), var(--pico-background-color)), url(/images/earth.jpg) no-repeat; */
    background-image: linear-gradient(0deg, var(--pico-background-color) 0%, var(--pico-card-border-color) 100%);
    background-size: cover;

    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>