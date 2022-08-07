
<script setup lang="ts">

import AppLayout from "@/templates/AppLayout.vue";
import { ref } from "vue";


</script>

<template>
    <AppLayout>
        <template #header>
            <div class="header">
                <div class="container">
                    <div class="headings">
                        <h1>Page not found</h1>
                        <p>The page you're looking for isn't here.</p>
                    </div>
                    <BaseButton to="/">Explore all maps</BaseButton>
                </div>
            </div>
        </template>
    </AppLayout>
</template>
<style scoped>
.header {
    height: 60vh;
    background-color: var(--background-color);
    /* background: linear-gradient(var(--card-border-color), var(--background-color)), url(/images/earth.jpg) no-repeat; */
    background-image: linear-gradient(0deg, var(--background-color) 0%, var(--card-border-color) 100%);
    background-size: cover;

    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>