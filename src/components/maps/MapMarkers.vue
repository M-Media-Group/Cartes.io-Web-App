<script setup lang="ts">
import { Marker } from '@/types/marker';
import { computed, defineAsyncComponent, PropType, ref } from 'vue';
import {
    LLayerGroup,
    LPopup,
} from "@vue-leaflet/vue-leaflet";
import MarkerCluster from "./MarkerCluster.vue";
import { useMarker } from '@/composables/marker';

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

const markerPopup = ref();

const { canDeleteMarker, deleteMarker } = useMarker();

const handleMarkerClick = (marker: Marker) => {
    selectedMarker.value = marker;
    markerPopup.value.leafletObject.openPopup({
        lat: marker.location.coordinates[1],
        lng: marker.location.coordinates[0],
    });
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
        <l-popup>
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
            </details>

            <a href="#"
                role="button"
                v-if="selectedMarker !== null && canDeleteMarker(selectedMarker)"
                @click.prevent="deleteMarker(mapId, selectedMarker)">Delete</a>

            <hr v-if="selectedMarker && canDeleteMarker(selectedMarker)" />

            <small>Last update:
                <span :datetime="selectedMarker?.updated_at">{{
                        selectedMarker?.updated_at
                }}</span>.
            </small>
            <!--
                  <a  v-if="canMarkAsSpamPost(marker)" @click="markAsSpam(selectedMarker.id)"
                    :disabled="submit_data.loading">Report as spam</a> -->
        </l-popup>
    </l-layer-group>
</template>
<style scoped>
small {
    display: block;
}
</style>
