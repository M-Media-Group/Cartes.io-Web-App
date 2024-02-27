<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import CreateMapButton from '@/components/CreateMapButton.vue';

</script>
<template>
    <AppLayout>
        <template #header>
            <div class="header">
                <div class="container">
                    <BaseHeading title="Create a new map"
                        subtitle="Create maps, add markers, and share anywhere without even having to sign up." />
                    <div class="grid">
                        <create-map-button text="Create a new map" />
                    </div>
                </div>
            </div>
        </template>
    </AppLayout>
</template>

<style scoped>
.header {
    min-height: 72vh;
    background-color: var(--pico-background-color);
    /* background: linear-gradient(var(--pico-card-border-color), var(--pico-background-color)), url(/images/earth.jpg) no-repeat; */
    background-image: linear-gradient(0deg, var(--pico-background-color) 0%, var(--pico-card-border-color) 100%);
    background-size: cover;

    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>