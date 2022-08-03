<script setup lang="ts">
import { useMap } from '@/composables/map';
import AppLayout from "@/templates/AppLayout.vue";
import NewMapComponent from '@/components/maps/NewMapComponent.vue';
import axios from 'axios';
import { Ref, ref } from 'vue';
import { Map } from '@/types/map.js';
import { useMarker } from '@/composables/marker.js';

const Maps = useMap();
Maps.getAllMaps().then(() => {
    // For each map, get all markers for it and wait in between each request
    Maps.maps.value.forEach(async map => {
        // if (map.markers_count && map.markers_count > 0) {
        // setTimeout(async () => {
        //     const markers = await Markers.getAllMarkersForMap(map.uuid);
        //     // Assign the markers to the map if the markers is an array
        //     if (Array.isArray(markers)) {
        //         map.markers = markers;
        //     }
        // }, 2000);
        // }
    });
});

const Markers = useMarker();

const privateMaps = ref([]) as Ref<Map[]>;

var ids = [] as string[];
Object.keys(localStorage).forEach(function (key) {
    if (key.includes("map_")) {
        ids.push(key.replace("map_", ""));
    }
});

if (ids.length > 0) {
    axios
        .get("/api/maps", {
            params: {
                ids: ids,
                orderBy: "updated_at",
            },
        })
        .then((response: { data: { data: Map[]; }; }) => {
            privateMaps.value = response.data.data;
            privateMaps.value.forEach(async map => {
                // If the markers_count is 0, then the map has no markers, so we can skip it
                // Wait a little to not hit the rate limit
                if (map.markers_count && map.markers_count > 0) {
                    setTimeout(async () => {
                        const markers = await Markers.getAllMarkersForMap(map.uuid);
                        // Assign the markers to the map if the markers is an array
                        if (Array.isArray(markers)) {
                            map.markers = markers;
                        }
                    }, 2000);
                }
            });
        });
}

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
            <article v-for="map in privateMaps"
                :key="map.uuid">
                <header>
                    <NewMapComponent :mapId="map.uuid"
                        :map="map"
                        :markers="map.markers ?? []"
                        style="height: 400px" />
                </header>
                <h3>{{ map.title ?? "Untitled map" }}</h3>
                <p>{{ map.description }}</p>
                <footer>
                    <router-link role="button"
                        :to="'/maps/' + map.uuid">
                        Open map
                    </router-link>
                </footer>
            </article>
        </section>
        <section>
            <h2>All maps</h2>
            <div v-for="map in Maps.maps.value"
                :key="map.uuid">
                <router-link :to="'/maps/' + map.uuid">
                    {{ map.title ?? "Untitled map" }} - {{ map.markers_count }} markers
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