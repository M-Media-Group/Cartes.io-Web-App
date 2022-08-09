<script setup lang="ts">
import { Marker } from '@/types/marker';
import { computed, PropType } from 'vue';
import {
    LLayerGroup,
} from "@vue-leaflet/vue-leaflet";
import MarkerCluster from "./MarkerCluster.vue";
import MapMarker from './MapMarker.vue';

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

</script>

<template>

    <!-- Doesnt seem we can use layer groups together with marker clustering -->


    <marker-cluster v-if="cluster"
        :options="{ showCoverageOnHover: true, chunkedLoading: true }">

        <map-marker v-for="marker in markers"
            :mapId="mapId"
            :marker="marker" />

    </marker-cluster>

    <l-layer-group v-else
        v-for="(category, index) in groupedMarkersByCategory"
        :key="index"
        ref="features"
        layer-type="overlay"
        :name="category[0].category.name">

        <map-marker v-for="marker in category"
            :mapId="mapId"
            :marker="marker" />

    </l-layer-group>
</template>
<style scoped>
small {
    display: block;
}
</style>