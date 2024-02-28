
<script setup lang="ts">
import { ref, computed, watch, Ref, onUnmounted, inject } from "vue";
import NewMapComponent from "@/components/maps/NewMapComponent.vue"
import { useMarker } from "@/composables/marker";
import { useMap } from "@/composables/map";
import MapCards from "@/components/maps/MapCards.vue";
import EditMapForm from "@/components/maps/EditMapForm.vue";
import DeveloperInfo from "@/components/DeveloperInfo.vue";
import AppLayout from "@/templates/AppLayout.vue";
import { useRoute, useRouter } from "vue-router";
import { useMapPosition } from "@/composables/mapPosition";

import { now } from "@/composables/time";
import { usePusher } from "@/composables/pusher";

import $bus, { eventTypes } from "@/eventBus/events";

import { updateOrCreateSchema } from "@m-media/vue3-meta-tags";
import MapAuthor from "@/components/maps/MapAuthor.vue";

import Markdown from 'vue3-markdown-it';
import { useUser } from "@/composables/user";

import userDevice from "@/classes/userDevice";
import { useLiveMapTracking } from "@/composables/liveMapTracking";
import OLMapVue from "@/components/maps/OLMapVue.vue";

const router = useRouter();
const route = useRoute();
const user = useUser();
const liveMapTracking = useLiveMapTracking();

const { markers, displayableMarkers, listenForMarkerChangesOnMap, showExpired, insertMarkersFromFile } = useMarker();

const Maps = useMap();

const cluster = ref(false);

// Get the map ID from the url ?mapId parameter
const mapId = ref(route.params.mapId) as Ref<string>;

const canCreateMarkers = ref();

const { center, averageCenter, zoom } = useMapPosition();

watch(() => route.params.mapId, () => {
    mapId.value = route.params.mapId as string;

    if (!route.query.lat || !route.query.lng) {
        center.value = averageCenter.value;
        zoom.value = 3;
    }

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
    navigator.share;
    if (navigator.share) {
        await navigator.share({
            title: "Cartes.io map",
            text: `Check out this map I made! ${url}`,
            url: url,
        }).then(() => {
            $bus.$emit(eventTypes.shared_map, { map: Maps.map.value, action: "navigator.share" });
        }).catch(() => {
            // Just need an empty catch to avoid the error
        });
    } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(url);
        $bus.$emit(eventTypes.shared_map, { map: Maps.map.value, action: "navigator.clipboard" });
        alert("Map link copied to clipboard!");
    }
}

const { leaveChannel, usernameToUse, trackedUsers, trackSocketIdView, setTrackSocketIdView } = usePusher();

const isLive = inject('isConnectedToPusher');

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

const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Dataset",
    "name": Maps.map.value?.title ?? "Untitled map",
    "description": Maps.map.value?.description,
    "url": window.location.href,
    // "sameAs": "https://gis.ncdc.noaa.gov/geoportal/catalog/search/resource/details.page?id=gov.noaa.ncdc:C00510",
    // "identifier": ["https://doi.org/10.1000/182",
    //     "https://identifiers.org/ark:/12345/fk1234"],
    // "keywords": [
    //     "ATMOSPHERE > ATMOSPHERIC PHENOMENA > CYCLONES",
    //     "ATMOSPHERE > ATMOSPHERIC PHENOMENA > DROUGHT",
    //     "ATMOSPHERE > ATMOSPHERIC PHENOMENA > FOG",
    //     "ATMOSPHERE > ATMOSPHERIC PHENOMENA > FREEZE"
    // ],
    "license": "https://creativecommons.org/publicdomain/zero/1.0/",
    "isAccessibleForFree": true,
    // "hasPart": [
    //     {
    //         "@type": "Dataset",
    //         "name": "Sub dataset 01",
    //         "description": "Informative description of the first subdataset...",
    //         "license": "https://creativecommons.org/publicdomain/zero/1.0/",
    //         "creator": {
    //             "@type": "Organization",
    //             "name": "Sub dataset 01 creator"
    //         }
    //     },
    //     {
    //         "@type": "Dataset",
    //         "name": "Sub dataset 02",
    //         "description": "Informative description of the second subdataset...",
    //         "license": "https://creativecommons.org/publicdomain/zero/1.0/",
    //         "creator": {
    //             "@type": "Organization",
    //             "name": "Sub dataset 02 creator"
    //         }
    //     }
    // ],
    "creator": {
        "@type": "Organization",
        "url": "https://app.cartes.io/",
        "name": "Cartes.io",
    },
    // "funder": {
    //     "@type": "Organization",
    //     "sameAs": "https://ror.org/00tgqzw13",
    //     "name": "National Weather Service"
    // },
    // "includedInDataCatalog": {
    //     "@type": "DataCatalog",
    //     "name": "data.gov"
    // },
    "distribution": [
        {
            "@type": "DataDownload",
            "encodingFormat": "JSON",
            "contentUrl": import.meta.env.VITE_API_URL + '/api/maps/' + Maps.map.value?.uuid
        }
    ],
    "temporalCoverage": Maps.map.value?.created_at + "/..",
    // "spatialCoverage": {
    //     "@type": "Place",
    //     "geo": {
    //         "@type": "GeoShape",
    //         "box": "18.0 -65.0 72.0 172.0"
    //     }
    // }
}

updateOrCreateSchema(structuredData);

$bus.$on(eventTypes.deleted_map, () => {
    router.push("/");
})

const hasOpenedContextMenu = ref(false);

// A computed value to determine if the basic create-marker tutorial should be shown. It should only show if 1. the user can create markers on the given map and 2. there were never any previous markers
const showCreateMarkerTutorial = computed(() => {
    if (hasOpenedContextMenu.value) {
        return false;
    }

    if (!canCreateMarkers) {
        return false;
    }

    if (markers.value.length > 0) {
        return false;
    }

    return true;
})

onUnmounted(() => {
    leaveChannel(mapId.value);
});

const handleClick = (lat: number, lng: number, zoomPassed: number) => {
    window.scrollTo(0, 0);

    center.value = { lat, lng };
    zoom.value = zoomPassed ?? 16;

}

$bus.$on(eventTypes.updated_tracked_view, (data: any) => {
    handleClick(data.lat, data.lng, data.zoom);
})

</script>

<template>
    <AppLayout>

        <template #header>
            <OLMapVue :mapId="mapId"
                :show-ar="true"
                :markers="displayableMarkers"
                style="height: 70vh"
                :autoCenterOnLoad="true"
                :map="Maps.map.value"
                :cluster="cluster"
                @openedContextMenu="hasOpenedContextMenu = true" />
            <kbd v-if="showCreateMarkerTutorial"
                style="z-index: 1000;position: absolute;text-align: center;bottom: var(--spacing);left: 50%;right: 50%;width: max-content;transform: translate(-50%, -50%);">Right
                click on
                the map to
                create a marker</kbd>
        </template>

        <template v-if="Maps.map">
            <div style="margin-top:var(--nav-element-spacing-vertical);">
                <section class="grid">
                    <div>
                        <BaseHeading :title='Maps.map.value?.title ?? "Untitled map"'
                            class="headings">
                            <template #subtitle>
                                <p>
                                    <MapAuthor v-if="Maps.map.value"
                                        :map="Maps.map.value" />
                                </p>
                            </template>
                        </BaseHeading>
                        <Markdown :source="Maps.map.value?.description"
                            :linkify="true"
                            class="markdown" />
                    </div>
                    <div>

                        <BaseButton v-if="Maps.map.value?.privacy !== 'private'"
                            @click="share()">Share this map</BaseButton>

                        <!-- Markers -->
                        <details open
                            v-if="markers && markers.length > 0"
                            style="padding-bottom: 0;">
                            <summary aria-haspopup="listbox"
                                role="button"
                                class="secondary">
                                <div v-if="isLive"
                                    class="blink"></div> {{ isLive ? 'Live feed' : 'Feed' }}
                                <span
                                    v-if="isLive && Maps.map.value?.users_currently_connected && Maps.map.value?.users_currently_connected > 1">
                                    - {{ Maps.map.value.users_currently_connected }} people connected
                                </span>
                            </summary>
                            <div
                                v-if="!showExpired && (!displayableMarkers || displayableMarkers.length === 0) && markers && markers.length > 0">
                                <BaseHeading as="h3"
                                    :title="`${markers.length - displayableMarkers.length} markers have expired.`"
                                    subtitle="There's no active markers to show. You can choose to show markers that have
                                        expired instead." />

                                <BaseButton @click="showExpired = true"
                                    class="secondary">
                                    Show expired markers
                                </BaseButton>
                            </div>
                            <MapCards v-else
                                role="listbox"
                                :markers="displayableMarkers" />
                        </details>

                        <!-- People -->
                        <details v-if="trackedUsers && Object.keys(trackedUsers).length > 0"
                            style="padding-bottom: 0;">
                            <summary aria-haspopup="listbox"
                                role="button"
                                class="secondary">
                                {{ Object.keys(trackedUsers).length }} people connected
                            </summary>
                            <div style="max-height: 54vh; overflow-y: scroll;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th scope="col">Username</th>
                                            <th scope="col">Sharing location</th>
                                            <th scope="
                                                col">Presenting</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="user, key in trackedUsers"
                                            :key="user.socketId">
                                            <th scope="row">{{ user.username || "Unknown user" }}</th>
                                            <td v-if="user.location"><a href="#"
                                                    @click.prevent="handleClick(user.location.latitude, user.location.longitude, user.location.zoom)">Go
                                                    to current location</a>
                                            </td>
                                            <td v-else>No</td>
                                            <td v-if="trackSocketIdView === key"><a href="#"
                                                    @click.prevent="setTrackSocketIdView(null)">Stop following</a></td>
                                            <td v-else-if="user.view">
                                                <a href="#"
                                                    @click.prevent="setTrackSocketIdView(key)">Start following
                                                    presentation</a>
                                            </td>
                                            <td v-else>No</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </details>

                        <p v-if="isLive && Object.keys(trackedUsers).length > 0">You're visible to others as <strong>{{
                            usernameToUse
                        }}</strong>. Read our <a href="/about/privacy">privacy FAQ</a> for more info.</p>

                        <!-- Map display options -->
                        <details>
                            <summary aria-haspopup="listbox"
                                role="button"
                                class="secondary">Map display options</summary>
                            <label style="display: none;"
                                v-if="0 && !showExpired"
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
                            <label>
                                <input type="checkbox"
                                    v-model="cluster" />
                                Cluster markers
                            </label>
                            <label>
                                <input type="checkbox"
                                    :checked="liveMapTracking.isSharingView.value && !!user.locationWatcherId.value"
                                    @change.prevent="liveMapTracking.toggleShareView()" />
                                <span data-tooltip="People will be able to follow you around the map">Share
                                    your view with others</span>
                            </label>
                            <template v-if="userDevice.supportsGeolocation">
                                <label>
                                    <input type="checkbox"
                                        :checked="!!user.locationWatcherId.value"
                                        @click="user.toggleLocationTracking()" />
                                    Enable location based services
                                </label>

                                <label v-if="!!user.locationWatcherId.value">
                                    <input type="checkbox"
                                        :checked="liveMapTracking.isSharingLocation.value && !!user.locationWatcherId.value"
                                        :disabled="!!!user.locationWatcherId.value"
                                        @change.prevent="liveMapTracking.toggleShareLocation()" />
                                    <span
                                        data-tooltip="Your location will be visible to anyone currently looking at this map">Share
                                        your location with others</span>
                                </label>
                            </template>
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

                        <p v-if="canCreateMarkers">Click (or tap on mobile) on the map to create a
                            marker. You can
                            choose
                            one of the existing
                            labels or create your own.</p>

                        <!-- Developer -->
                        <details v-if="Maps.map.value">
                            <summary>About this maps privacy</summary>
                            <div>
                                <p v-if="Maps.map.value.privacy === 'public'">
                                    Everyone can find and see this map. It also shows up in our public maps and in
                                    Google search results.
                                </p>
                                <p v-else-if="Maps.map.value.privacy === 'unlisted'">
                                    Only people with a direct link to this map can see it. It won't show up in our
                                    public maps, and it won't show up in Google when people search for it.
                                </p>
                                <p v-else-if="Maps.map.value.privacy === 'private'">
                                    Only you can see this map when you are logged in. Your map won't show up in our
                                    public maps, and it won't show up in Google when people search for it.
                                </p>

                                <p v-if="Maps.map.value.user && Maps.map.value.user.is_public === false">
                                    Your profile is set to private, which means that no one will be able to see you as
                                    the author of this map. People will only be able to see that it has been created by
                                    a Cartes.io user, but not any other information, and nothing specific to you.
                                </p>
                                <p v-else-if="Maps.map.value.user && Maps.map.value.user.is_public === true">
                                    People on this map can see the username of the person that
                                    created this map, and they can visit the public profile of the map author.
                                </p>
                                <p v-else-if="Maps.map.value.is_linked_to_user">
                                    When someone opens this map, they will only be able to see a general notice that it
                                    was created
                                    by a Cartes.io user, but not any information about who it is specifically.
                                </p>
                                <p v-else>
                                    Nobody can see any author information of this map because it was created by someone
                                    without an account, a person that has not logged in, or someone who has not
                                    connected this map to their account.
                                </p>

                                <p>
                                    Consult the <a href="/about/privacy">privacy FAQ</a> for more info.
                                </p>
                            </div>
                        </details>

                        <!-- Public contributors -->
                        <details
                            v-if="Maps.map.value?.public_contributors && Maps.map.value?.public_contributors.length > 0">
                            <summary>Public contributors</summary>
                            <p>These people have contributed markers to this map and have their profile set to public.
                            </p>
                            <template v-if="Maps.map.value?.public_contributors.length > 0">
                                <div v-for="user in Maps.map.value?.public_contributors">
                                    <router-link :to="'/users/' + user.username">
                                        <!-- <div class="grid"> -->
                                        <!-- <img height="24"
                                            width="24"
                                            :src="user.avatar ?? 'https://via.placeholder.com/96'"
                                            :alt="user.avatar + ' avatar on Cartes.io'" /> -->
                                        <div class="headings">
                                            <p>{{ user.username }}</p>
                                            <p>{{ user.description }}</p>
                                        </div>
                                        <!-- </div> -->
                                    </router-link>
                                </div>
                            </template>
                            <p v-else>There's no public contributors to show.</p>
                        </details>

                        <!-- Developer -->
                        <details v-if="Maps.map.value">
                            <summary>Developer info</summary>
                            <DeveloperInfo :map="Maps.map.value" />
                        </details>

                        <!-- Data Import, if the user currentUserHasPermission('create markers in bulk')-->
                        <details v-if="Maps.map.value">
                            <summary>Data import</summary>
                            <p>Import data from a GPX file to create markers on this map.</p>
                            <input type="file"
                                accept=".gpx"
                                @change="insertMarkersFromFile(Maps.map.value.uuid,
                                    // Pass the file to the function
                                    $event.target?.files[0]
                                )" />
                        </details>

                    </div>
                </section>

                <section v-if="Maps.map.value?.related && Maps.map.value.related.length > 0">
                    <BaseHeading as="h2"
                        title='Related maps' />
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
</style>