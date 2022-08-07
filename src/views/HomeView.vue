<script setup lang="ts">
import { useMap } from '@/composables/map';
import AppLayout from "@/templates/AppLayout.vue";
import axios from 'axios';
import { Ref, ref, watch } from 'vue';
import { Map } from '@/types/map';
import { useMarker } from '@/composables/marker';
import { useUser } from '@/composables/user';
import MapArticle from '@/components/MapArticle.vue';

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

const { users, getUsers, user } = useUser();

getUsers();

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
                orderBy: "updated_at",
                withMine: user.value ? 1 : 0,
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

                    <MapArticle v-for="map in privateMaps"
                        :key="map.uuid"
                        :map="map" />

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
                        <MapArticle v-for="(map, i) in Maps.maps.value"
                            :key="map.uuid"
                            :map="map"
                            :showMap="i < 2 ? true : false" />
                    </div>
                    <div>Showing {{ Maps.maps.value.length }} out of {{ Maps.totalMaps.value }} public maps and
                        many more
                        private ones
                    </div>
                </section>

                <section>
                    <div class="headings">
                        <h2>Public profiles</h2>
                        <p>These profiles are public on Cartes.io</p>
                    </div>
                    <div>
                        <article v-for="user in users">
                            <h3>{{ user.username }}</h3>
                            <p v-if="user.description">{{ user.description }}</p>
                            <router-link :to="`/users/${user.username}`"
                                custom
                                v-slot="{ navigate }">
                                <button @click="navigate">View profile</button>
                            </router-link>
                            <footer v-if="user.public_maps_count">
                                {{ user.public_maps_count }} public maps
                            </footer>
                        </article>
                    </div>
                </section>
            </div>
            <aside>
                <h4>Cartes.io.</h4>
                <p>This is an open source project. Feel free to contribute to the development on <a
                        href="https://github.com/M-Media-Group/Cartes.io">GitHub</a></p>
                <p>
                    <router-link to="/register">Sign up</router-link> to Cartes.io to get more info, make
                    maps private, and get updates as the project grows.
                </p>
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

@media (min-width: 992px) {
    .column-2-grid {
        grid-template-columns: 1fr 1fr;
    }

    .column-4-1-grid {
        grid-template-columns: 4fr 1fr;
    }
}
</style>