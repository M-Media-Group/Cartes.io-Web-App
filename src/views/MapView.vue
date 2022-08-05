
<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted, ref, defineAsyncComponent, computed, watch, Ref } from "vue";
import NewMapComponent from "@/components/maps/NewMapComponent.vue"
import { useMarker } from "@/composables/marker";
import { useMap } from "@/composables/map";
import userDevice from "@/classes/userDevice";
import MapCards from "@/components/maps/MapCards.vue";
import EditMapForm from "@/components/maps/EditMapForm.vue";
import DeveloperInfo from "@/components/DeveloperInfo.vue";
import AppLayout from "@/templates/AppLayout.vue";
import { useRoute } from "vue-router";
import { useMapPosition } from "@/composables/mapPosition";

import { now } from "@/composables/time";
import { usePusher } from "@/composables/pusher";

import $bus, { eventTypes } from "@/eventBus/events";

const route = useRoute();

const { markers, displayableMarkers, getAllMarkersForMap, listenForMarkerChangesOnMap, showExpired } = useMarker();

const Maps = useMap();

// Get the map ID from the url ?mapId parameter
const mapId = ref(route.params.mapId) as Ref<string>;

const canCreateMarkers = ref();

const { center, averageCenter, zoom } = useMapPosition();

watch(() => route.params.mapId, () => {
    mapId.value = route.params.mapId as string;

    getAllMarkersForMap(mapId.value).then(() => {
        if (!route.query.lat || !route.query.lng) {
            center.value = averageCenter.value;
            zoom.value = 3;
        }
    });

    Maps.getRelatedMaps(mapId.value);
    listenForMarkerChangesOnMap(mapId.value);
    if (Maps.map.value) {
        canCreateMarkers.value = Maps.canCreateMarkers(Maps.map.value);
    }
}, { immediate: true });

const share = async () => {
    // Current url
    const url = window.location.href;
    // Trigger the Share Web API, or copy to clipboard if not supported
    const sharer = navigator.share;
    if (navigator.share) {
        await navigator.share({
            title: "Cartes.io map",
            text: `Check out this map I made! ${url}`,
            url: url,
        }).then(e => {
            $bus.$emit(eventTypes.shared_map, { map: Maps.map.value, action: "navigator.share" });
        }).catch((e) => {
            // Just need an empty catch to avoid the error
        });
    } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(url);
        $bus.$emit(eventTypes.shared_map, { map: Maps.map.value, action: "navigator.clipboard" });
        alert("Map link copied to clipboard!");
    }
}

const { isLive } = usePusher();

const mapAgeInMinutes = computed(() => {
    if (Maps.map.value) {
        const createdAt = new Date(Maps.map.value.created_at);
        const diff = now.value - createdAt.getTime();
        return Math.round(diff / 60000);
    }
    return 0;
});

const mapCreatedTimeAgo = computed(() => {
    if (Maps.map) {
        return new Intl.RelativeTimeFormat("en-US").format(-mapAgeInMinutes.value, 'minute');
    }
})
</script>

<template>
    <AppLayout>

        <template #header>
            <NewMapComponent :mapId="mapId"
                :show-ar="true"
                :markers="displayableMarkers"
                style="height: 70vh"
                :autoCenterOnLoad="true"
                @showAr="$router.push('/maps/' + mapId + '/ar')"
                :map="Maps.map.value" />
        </template>

        <template v-if="Maps.map">
            <div style="margin-top:var(--nav-element-spacing-vertical);">
                <section class="grid">
                    <div>

                        <div style="display: none;">
                            <img height="16"
                                width="16"
                                src="https://via.placeholder.com/16"
                                alt="Cartes.io logo" />
                            Anonymous
                        </div>

                        <h1>{{ Maps.map.value?.title ?? "Untitled map" }}</h1>
                        <p style="white-space: pre-wrap;">{{ Maps.map.value?.description }}</p>
                    </div>
                    <div>

                        <button @click="share()">Share this map</button>

                        <!-- Markers -->
                        <details open
                            v-if="markers && markers.length > 0"
                            style="padding-bottom: 0;">
                            <summary aria-haspopup="listbox"
                                role="button"
                                class="secondary">
                                <div v-if="isLive"
                                    class="blink"></div> {{ isLive ? 'Live feed' : 'Feed' }}
                            </summary>
                            <div
                                v-if="!showExpired && (!displayableMarkers || displayableMarkers.length === 0) && markers && markers.length > 0">
                                <div class="headings">
                                    <h3>There's no active markers to show.</h3>
                                    <p>When new markers are added, they'll show here.</p>
                                </div>
                                <button @click="showExpired = true"
                                    class="secondary">
                                    Show expired markers
                                </button>
                            </div>
                            <MapCards v-else
                                role="listbox"
                                :markers="displayableMarkers" />
                        </details>

                        <!-- Map display options -->
                        <details>
                            <summary role="button"
                                class="secondary">Map display options</summary>
                            <label style="display: none;"
                                v-if="!showExpired"
                                for="range">Timeline
                                <input type="range"
                                    min="0"
                                    :max="mapAgeInMinutes"
                                    :value="mapAgeInMinutes"
                                    id="range"
                                    name="range">
                                <small>From {{ mapCreatedTimeAgo }} to now</small>
                            </label>
                            <!-- Checkbox to show expired -->
                            <label>
                                <input type="checkbox"
                                    v-model="showExpired" />
                                Also show expired markers
                            </label>
                        </details>

                        <!-- Settings -->
                        <details v-if="Maps.map.value && Maps.canUpdateMap(Maps.map.value)">
                            <summary aria-haspopup="listbox"
                                role="button"
                                class="secondary">
                                Map settings
                            </summary>
                            <EditMapForm role="listbox"
                                :map="Maps.map.value" />
                        </details>

                        <p v-if="canCreateMarkers">Right click (or long-tap on mobile) on the map to create a
                            marker. You can
                            choose
                            one of the existing
                            labels or create your own.</p>

                        <!-- Developer -->
                        <details v-if="Maps.map.value">
                            <summary>Developer info</summary>
                            <DeveloperInfo :map="Maps.map.value" />
                        </details>

                    </div>
                </section>

                <section v-if="Maps.map.value?.related && Maps.map.value.related.length > 0">
                    <h2>Related maps</h2>
                    <ul>
                        <li v-for="map in Maps.map.value.related"
                            :key="map.uuid">
                            <router-link :to="'/maps/' + map.uuid">{{ map.title ?? "Untitled map" }}</router-link>
                        </li>
                    </ul>
                </section>
            </div>
        </template>
    </AppLayout>
</template>
<style scoped>
summary {
    position: relative;
}

.blink {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 15px;
    height: 15px;
}

.blink:before {
    content: "";
    position: relative;
    display: block;
    width: 300%;
    height: 300%;
    box-sizing: border-box;
    margin-left: -100%;
    margin-top: -100%;
    border-radius: 45px;
    background-color: red;
    -webkit-animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.blink:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    width: 100%;
    height: 100%;
    background-color: red;
    border-radius: 15px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
    -webkit-animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
    animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
}

@-webkit-keyframes pulse-ring {
    0% {
        transform: scale(0.33);
    }

    80%,
    100% {
        opacity: 0;
    }
}

@keyframes pulse-ring {
    0% {
        transform: scale(0.33);
    }

    80%,
    100% {
        opacity: 0;
    }
}

@-webkit-keyframes pulse-dot {
    0% {
        transform: scale(0.8);
    }

    50% {
        transform: scale(1);
    }

    100% {
        transform: scale(0.8);
    }
}

@keyframes pulse-dot {
    0% {
        transform: scale(0.8);
    }

    50% {
        transform: scale(1);
    }

    100% {
        transform: scale(0.8);
    }
}

h1 {
    margin-bottom: var(--spacing);
}
</style>