<script setup lang="ts">
import { useMap } from '@/composables/map';
import AppLayout from "@/templates/AppLayout.vue";
import axios from 'axios';
import { Ref, ref, watch } from 'vue';
import { Map } from '@/types/map';
import { useMarker } from '@/composables/marker';
import { useUser } from '@/composables/user';
import MapArticle from '@/components/MapArticle.vue';
import CreateMapButton from '@/components/CreateMapButton.vue';

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
                    <BaseHeading title="Maps for everyone and everything"
                        subtitle="Create maps, add markers, and share anywhere without even having to sign up." />
                    <div class="grid">

                        <create-map-button text="Create a new map" />

                        <div>
                            <BaseButton class="secondary"
                                v-if="!user"
                                to="/register">Sign up, if you want
                            </BaseButton>
                            <BaseButton class="secondary"
                                v-else
                                to="/me">My account
                            </BaseButton>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <div class="grid column-4-1-grid">
            <div>
                <BaseSection title="Your maps"
                    subtitle="These are the maps that you've created on the site.">

                    <MapArticle v-for="map in privateMaps"
                        :key="map.uuid"
                        :map="map" />

                    <article v-if="privateMaps.length === 0">
                        <BaseHeading as="h3"
                            title="You have no maps yet."
                            subtitle="Create your first map or browse the public ones." />
                        <create-map-button text="Create a new map" />
                    </article>
                </BaseSection>
                <BaseSection title="Public maps"
                    subtitle="These maps are made by the community and shared with everyone.">

                    <MapArticle v-for="(map, i) in Maps.maps.value"
                        :key="map.uuid"
                        :map="map"
                        :showDescription="true"
                        :showMap="true"
                        :showFooter="false" />

                    <div>Showing {{ Maps.maps.value.length }} out of {{ Maps.totalMaps.value }} public maps and
                        many more
                        private ones
                    </div>
                </BaseSection>

                <BaseSection title="Public profiles"
                    subtitle="These profiles are public on Cartes.io">

                    <article v-for="user in users">
                        <BaseHeading as="h3"
                            :title='user.username' />
                        <p v-if="user.description">{{ user.description }}</p>
                        <BaseButton :to="`/users/${user.username}`">View profile</BaseButton>
                        <footer v-if="user.public_maps_count">
                            {{ user.public_maps_count }} public maps
                        </footer>
                    </article>

                </BaseSection>
            </div>
            <aside>
                <h4>Cartes.io.</h4>
                <p>This is an open source project. Feel free to contribute to the development on <a
                        href="https://github.com/M-Media-Group/Cartes.io">GitHub</a></p>
                <p>
                    <router-link to="/register">Sign up</router-link> to Cartes.io to get more info, make
                    maps private, and get updates as the project grows.
                </p>

                <iframe src="https://github.com/sponsors/M-Media-Group/button"
                    title="Sponsor M-Media-Group"
                    height="35"
                    width="116"
                    style="border: 0;"></iframe>
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

.scrollableGrid {
    grid-template-rows: 1fr 1fr;
    grid-auto-flow: column;
    overflow-y: scroll;
    width: 100%;
    grid-template-columns: unset;

    width: 99vw;
    margin-left: -4rem;
    align-items: flex-start;

    grid-auto-columns: 1fr;
}

.scrollableGrid>* {
    min-width: unset;
    align-items: flex-start;
}




.horizontal-media-scroller {
    --size: 150px;
    display: grid;
    grid-auto-columns: minmax(60vw, 280px);
    grid-auto-flow: column;
    grid-auto-flow: column;
    gap: calc(var(--grid-spacing-horizontal) / 2);
    margin: 0;
    padding-inline-end: var(--grid-spacing-horizontal);
    padding-block-start: calc(var(--grid-spacing-horizontal) / 2);
    padding-block-end: calc(var(--grid-spacing-horizontal) / 2);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline mandatory;
    scroll-padding-left: var(--grid-spacing-horizontal);
    scroll-padding-right: var(--grid-spacing-horizontal);
    scroll-padding-inline: var(--grid-spacing-horizontal);
}

@media (prefers-reduced-motion: no-preference) {
    .horizontal-media-scroller {
        scroll-behavior: smooth;
    }
}

.horizontal-media-scroller>li {
    display: inline-block;
    /*  container padding fix  */
}

.horizontal-media-scroller>li:last-of-type figure {
    position: relative;
}

.horizontal-media-scroller>li:last-of-type figure::after {
    content: "";
    position: absolute;
    inline-size: var(--grid-spacing-horizontal);
    block-size: 100%;
    inset-block-start: 0;
    inset-inline-end: calc(var(--grid-spacing-horizontal) * -1);
}

.horizontal-media-scroller figure {
    scroll-snap-align: start;
}

.horizontal-media-scroller a {
    display: inline-block;
    text-decoration: none;
    color: inherit;
    outline-offset: 12px;
}

.horizontal-media-scroller a:focus {
    outline-offset: 7px;
}

@media (prefers-reduced-motion: no-preference) {
    .horizontal-media-scroller a {
        transition: outline-offset 0.25s ease;
    }
}
</style>