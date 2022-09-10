<script setup lang="ts">
import { Marker } from '@/types/marker';
import { computed, defineAsyncComponent, PropType } from 'vue';
import {
    LLayerGroup,
} from "@vue-leaflet/vue-leaflet";
import MarkerCluster from "./MarkerCluster.vue";

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
</script>

<template>
    <marker-cluster v-if="cluster && markers.length > 0">
        :options="{ showCoverageOnHover: true, chunkedLoading: true }">

        <map-marker v-for="marker in markers"
            :mapId="mapId"
            :marker="marker" />

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
                :marker="marker" />
        </template>
    </l-layer-group>
</template>
