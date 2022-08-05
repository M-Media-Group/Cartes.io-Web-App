<script setup lang="ts">
import { useMap } from '@/composables/map';
import AppLayout from "@/templates/AppLayout.vue";
import NewMapComponent from '@/components/maps/NewMapComponent.vue';
import axios from 'axios';
import { Ref, ref, watch } from 'vue';
import { Map } from '@/types/map';
import { useMarker } from '@/composables/marker';
import { useUser } from '@/composables/user';

const url = import.meta.env.VITE_API_URL;

const Maps = useMap();
Maps.getAllMaps().then(() => {
    // For each map, get all markers for it and wait in between each request
    Maps.maps.value.forEach(async (map, index) => {
        if (map.markers_count && map.markers_count > 0 && index < 2) {
            setTimeout(async () => {
                const markers = await Markers.getAllMarkersForMap(map.uuid);
                // Assign the markers to the map if the markers is an array
                if (Array.isArray(markers)) {
                    map.markers = markers;
                }
            }, 3000);
        }
    });
});

const Markers = useMarker();
const { user } = useUser();


const privateMaps = ref([]) as Ref<Map[]>;

var ids = [] as string[];
Object.keys(localStorage).forEach(function (key) {
    if (key.includes("map_")) {
        ids.push(key.replace("map_", ""));
    }
});

const getMyMaps = () => {
    axios
        .get("/api/maps", {
            params: {
                ids: ids ?? [],
                withMine: 1,
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

if (ids.length > 0 || user.value?.id) {
    getMyMaps();
}

watch(() => user.value?.id, () => {
    getMyMaps();
});

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
                            <router-link class="secondary"
                                role="button"
                                v-if="!user"
                                to="/register">Sign up, if you want
                            </router-link>
                            <router-link class="secondary"
                                role="button"
                                v-else
                                to="/me">My account
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <div class="grid column-4-1-grid">
            <div>
                <section>
                    <div class="headings">
                        <h2>Your maps</h2>
                        <p>These are the maps that you've created on the site.</p>
                    </div>

                    <article v-for="map in privateMaps"
                        :key="map.uuid">
                        <header class="full">
                            <NewMapComponent :mapId="map.uuid"
                                :map="map"
                                :markers="map.markers ?? []"
                                style="height: 400px" />
                        </header>
                        <h3>{{ map.title ?? "Untitled map" }}</h3>
                        <p>{{ map.description }}</p>
                        <router-link :to="'/maps/' + map.uuid"
                            custom
                            v-slot="{ navigate }">
                            <button @click="navigate">Open map</button>
                        </router-link>
                        <footer>

                            <small>{{ map.markers_count }} live markers</small>
                        </footer>
                    </article>

                    <article v-if="privateMaps.length === 0">
                        <div class="headings">
                            <h3>You have no maps yet.</h3>
                            <p>Create your first map or browse the public ones.</p>
                        </div>
                        <button @click="Maps.addMap(null, true);">
                            Create a new map
                        </button>
                    </article>
                </section>
                <section>
                    <div class="headings">
                        <h2>Public maps</h2>
                        <p>These maps are made by the community and shared with everyone.</p>
                    </div>
                    <div>
                        <article v-for="(map, i) in Maps.maps.value"
                            :key="map.uuid">
                            <header class="full"
                                v-if="i < 2 ? true : false">
                                <NewMapComponent :mapId="map.uuid"
                                    :map="map"
                                    :markers="map.markers ?? []"
                                    style="height: 400px" />
                            </header>
                            <h3>{{ map.title ?? "Untitled map" }}</h3>
                            <p>{{ map.description }}</p>
                            <router-link :to="'/maps/' + map.uuid"
                                custom
                                v-slot="{ navigate }">
                                <button @click="navigate">Open map</button>
                            </router-link>
                            <footer>

                                <small>{{ map.markers_count }} live markers</small>
                            </footer>
                        </article>
                    </div>
                    <div>Showing {{ Maps.maps.value.length }} out of {{ Maps.totalMaps.value }} public maps and
                        many more
                        private ones
                    </div>
                </section>
            </div>
            <aside>
                <h4>Cartes.io.</h4>
                <p>This is an open source project. Feel free to contribute to the development on <a
                        href="https://github.com/M-Media-Group/Cartes.io">GitHub</a></p>
                <p><a :href="url + '/register'">Sign up</a> to Cartes.io to get more info, make
                    maps private, and get updates as the project grows.</p>
            </aside>
        </div>
    </AppLayout>
</template>

<style scoped>
.header {
    min-height: 23rem;
    background-color: var(--background-color);
    /* background: linear-gradient(var(--card-border-color), var(--background-color)), url(/images/earth.jpg) no-repeat; */
    background-image: linear-gradient(0deg, var(--background-color) 0%, var(--card-border-color) 100%);
    background-size: cover;

    display: flex;
    flex-direction: column;
    justify-content: center;
}

article>header.full {
    padding: 0;
}

/* The first article child of a section */
article {
    margin-top: 0;
}

@media (min-width: 992px) {
    .column-2-grid {
        grid-template-columns: 1fr 1fr;
    }

    .column-4-1-grid {
        grid-template-columns: 4fr 1fr;
    }
}

h3 {
    margin-bottom: var(--spacing);
}
</style>