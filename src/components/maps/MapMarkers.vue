<script setup lang="ts">
import { Marker } from '@/types/marker';
import { computed, defineAsyncComponent, PropType, ref } from 'vue';
import {
    LLayerGroup,
    LPopup,
    LCircleMarker,
} from "@vue-leaflet/vue-leaflet";
import MarkerCluster from "./MarkerCluster.vue";
import { useMarker } from '@/composables/marker';
import { useUser } from '@/composables/user';
import { useLiveMapTracking } from '@/composables/liveMapTracking';
import { usePusher } from '@/composables/pusher';

const user = useUser();

const props = defineProps({
    mapId: {
        type: String,
        required: true,
    },
    markers: {
        type: Array as PropType<Marker[]>,
        required: true,
    },
    cluster: {
        type: Boolean,
        default: true,
    }
})

const groupedMarkersByCategory = computed(() => {
    const markers = props.markers;
    const groupedMarkers = {} as Record<number, Marker[]>;
    markers.forEach(marker => {
        if (!groupedMarkers[marker.category_id]) {
            groupedMarkers[marker.category_id] = [];
        }
        groupedMarkers[marker.category_id].push(marker);
    });
    return groupedMarkers;
});

// Importing async here causes two circles to be drawn...
// const MarkerCluster = defineAsyncComponent(() =>
//     import('@/components/maps/MarkerCluster.vue')
// )

const MapMarker = defineAsyncComponent(() =>
    import('@/components/maps/MapMarker.vue')
)

const selectedMarker = ref(null as Marker | null);
const parsedMetadata = ref(null as null | string);

const markerPopup = ref();

const { canDeleteMarker, deleteMarker, trackedUsers } = useMarker();

const { isSharingLocation } = useLiveMapTracking();

const { usernameToUse } = usePusher();

const handleMarkerClick = (marker: Marker) => {
    selectedMarker.value = marker;
    markerPopup.value.leafletObject.openPopup({
        lat: marker.location.coordinates[1],
        lng: marker.location.coordinates[0],
    });

    if (marker.meta) {
        parsedMetadata.value = parseMetadata(marker.meta);
    } else {
        parsedMetadata.value = null;
    }
}

const handleMarkerDelete = (marker: Marker) => {
    if (marker !== null && canDeleteMarker(marker)) {
        deleteMarker(props.mapId, marker);
        markerPopup.value.leafletObject.closePopup();
        selectedMarker.value = null;
        parsedMetadata.value = null;
    }
}

// Metadata can be either an array, or a key value pair of items
const parseMetadata = (meta: JSON) => {
    // @todo - Need to also handle recursive data

    if (Array.isArray(meta)) {
        return meta.join(", ");
    } else {
        return Object.entries(meta).map(([key, value]) => `${key}: ${value}`).join(", ");
    }
}

</script>

<template>
    <marker-cluster v-if="cluster && markers.length > 0">
        :options="{ showCoverageOnHover: true, chunkedLoading: true }">

        <map-marker v-for="marker in markers"
            :mapId="mapId"
            :marker="marker"
            @clicked="handleMarkerClick" />

    </marker-cluster>

    <!-- Keeping the layer but not showing it (using visible instead of v-if) and then conditionally loading the map-markers prevents the layergroup from being added multiple times on each addition on the dom -->
    <l-layer-group :visible="!cluster"
        v-for="(category, index) in groupedMarkersByCategory"
        :key="index"
        ref="features"
        layer-type="overlay"
        :name="category[0].category.name">

        <template v-if="!cluster">
            <map-marker v-for="marker in category"
                :mapId="mapId"
                :marker="marker"
                @clicked="handleMarkerClick" />
        </template>
    </l-layer-group>

    <l-layer-group ref="markerPopup">
        <LPopup>
            <p style="min-width: 200px">
                <b>{{ selectedMarker?.category.name }}</b>
            </p>
            <p v-if="selectedMarker?.description"
                v-html="selectedMarker.description"></p>
            <small v-if="selectedMarker?.link"><a :href="selectedMarker.link"
                    target="blank">{{
                        selectedMarker.link.split("/")[2]
                    }}</a>
            </small>

            <!-- <small v-if="isMarkerExpired(selectedMarker.expires_at)" >Expired:
                    <span  :datetime="selectedMarker.expires_at">{{
                        selectedMarker.expires_at
                    }}</span>.</small> -->

            <details>
                <summary>Location</summary>
                <!-- <p v-if="searchResults && searchResults[0] && searchResults[0].label">{{ searchResults[0].label }}
                            </p>
                            <p v-else:aria-busy="true">Searching</p> -->
                <small v-if="selectedMarker?.elevation">Elevation:
                    {{ selectedMarker.elevation }} meters
                </small>
                <small>Coordinates: {{ selectedMarker?.location.coordinates[1] }} {{
                    selectedMarker?.location.coordinates[0]
                }}</small>
                <small v-if="selectedMarker?.address">Address: {{ selectedMarker?.address }}</small>
            </details>

            <details v-if="parsedMetadata">
                <summary>Metadata</summary>
                <small>{{ parsedMetadata }}</small>
            </details>

            <a href="#"
                role="button"
                v-if="selectedMarker !== null && canDeleteMarker(selectedMarker)"
                @click.prevent="handleMarkerDelete(selectedMarker)">Delete</a>

            <hr v-if="selectedMarker && canDeleteMarker(selectedMarker)" />

            <small v-if="selectedMarker?.updated_at">Last update:
                <time :datetime="String(selectedMarker?.updated_at)">{{
                    new Date(selectedMarker?.updated_at).toLocaleString()
                }}</time>
            </small>
            <small v-if="selectedMarker?.locations_count && selectedMarker?.locations_count > 1">
                <span>Moved
                    {{ selectedMarker?.locations_count - 1 }} times</span>
            </small>
            <!--
                  <a  v-if="canMarkAsSpamPost(marker)" @click="markAsSpam(selectedMarker.id)"
                    :disabled="submit_data.loading">Report as spam</a> -->
        </LPopup>
    </l-layer-group>
    <l-layer-group v-if="user.currentLocation.value && user.locationWatcherId">
        <LCircleMarker :radius="5"
            :lat-lng="[user.currentLocation.value?.latitude, user.currentLocation.value?.longitude]"
            color='#03A678'>
            <LPopup>
                <p>
                    <b>{{ usernameToUse }} (you)</b>
                    <small v-if="!isSharingLocation">Only you can see this</small>
                    <b v-else> - Everyone can see this</b>
                </p>
                <p>Accuracy: ± {{ user.currentLocation.value.accuracy.toFixed(2) }} meters</p>
                <p v-if="user.currentLocation.value.altitude">Altitude: {{
                    user.currentLocation.value.altitude.toFixed(2)
                }} meters</p>
                <p v-if="user.currentLocation.value.altitudeAccuracy">Altitude accuracy: ± {{
                    user.currentLocation.value.altitudeAccuracy.toFixed(2)
                }} meters</p>
                <p v-if="user.currentLocation.value.speed">Speed: {{ user.currentLocation.value.speed.toFixed(2) }}
                    kilometers per hour</p>
                <p v-if="user.currentLocation.value.heading">Heading: {{
                    user.currentLocation.value.heading.toFixed(2)
                }} degrees</p>
            </LPopup>
        </LCircleMarker>
    </l-layer-group>

    <l-layer-group v-if="trackedUsers">
        <!-- Create a circle marker for each tracked user location -->
        <template v-for="(data, index) in trackedUsers"
            :key="index">
            <LCircleMarker v-if="data.location?.latitude && data.location?.longitude"
                :radius="5"
                :lat-lng="[data.location.latitude, data.location.longitude]">
                <LPopup>
                    <p>{{ data.username ?? "Unknown" }}</p>
                </LPopup>
            </LCircleMarker>
        </template>
    </l-layer-group>
</template>
<style scoped>
small {
    display: block;
}
</style>
