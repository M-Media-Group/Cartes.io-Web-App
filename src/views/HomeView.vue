<script setup lang="ts">
import { useMap } from '@/composables/map';
import AppLayout from "@/templates/AppLayout.vue";

const Maps = useMap();
Maps.getAllMaps();

</script>
<template>
    <AppLayout>
        <template #header>
            <div class="header">
                <div class="container">
                    <div class="headings">
                        <h1>Maps for everyone and everything</h1>
                        <p>Create maps, add markers, and share anywhere without even having to sign up.</p>
                    </div>

                    <div class="grid">

                        <button @click="Maps.addMap(null, true);">
                            Create a new map
                        </button>

                        <div>
                            <a role="button"
                                class="secondary"
                                href="https://cartes.io/register">Sign up, if you want</a>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <section>
            <h2>Your maps</h2>
            <div v-for="map in Maps.maps.value"
                :key="map.uuid">
                <router-link :to="'/maps/' + map.uuid">
                    {{ map.title ?? "Untitled map" }}
                </router-link>
            </div>
        </section>
        <section>
            <h2>All maps</h2>
            <div v-for="map in Maps.maps.value"
                :key="map.uuid">
                <router-link :to="'/maps/' + map.uuid">
                    {{ map.title ?? "Untitled map" }}
                </router-link>
            </div>
        </section>
    </AppLayout>
</template>

<style scoped>
.header {
    min-height: 20rem;
    height: 50vh;
    max-height: 500px;
    background: linear-gradient(rgba(28, 119, 195, 0.2), var(--background-color)), url(/images/earth.jpg) no-repeat;
    background-size: cover;

    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>