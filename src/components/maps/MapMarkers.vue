<script setup lang="ts">
import { useMarker } from '@/composables/marker';
import { Marker } from '@/types/marker';
import { computed, PropType } from 'vue';
import {
    LIcon,
    LMarker,
    LPopup,
} from "@vue-leaflet/vue-leaflet";
import MarkerCluster from "./MarkerCluster.vue";
import $bus, { eventTypes } from "@/eventBus/events";

const props = defineProps({
    mapId: {
        type: String,
        required: true,
    },
    markers: {
        type: Array as PropType<Marker[]>,
        required: true,
    },
})

const { canDeleteMarker, deleteMarker, canCreateMarker } = useMarker();

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

const handleMarkerClick = (marker: Marker) => {
    $bus.$emit(eventTypes.opened_marker_popup, marker);
}

</script>

<template>

    <!-- Doesnt seem we can use layer groups together with marker clustering -->
    <!-- <l-layer-group v-for="(category, index) in groupedMarkersByCategory"
        :key="index"
        ref="features"
        layer-type="overlay"
        :name="category[0].category.name"> -->

    <marker-cluster :options="{ showCoverageOnHover: true, chunkedLoading: true }">

        <l-marker v-for="marker in markers"
            :lat-lng="[marker.location.coordinates[1], marker.location.coordinates[0]]"
            :key="'map-' + mapId + '|' + marker.id + '-marker'"
            @click="handleMarkerClick(marker)">
            <l-icon :icon-url="marker.category?.icon ?? '/images/marker-01.svg'"
                :icon-size="[30, 30]"
                :icon-anchor="[15, 25]" />
            <l-popup>
                <p style="min-width: 200px">
                    <b>{{ marker.category.name }}</b>
                </p>
                <p v-if="marker.description"
                    v-html="marker.description"></p>
                <small v-if="marker.link"><a :href="marker.link"
                        target="blank">{{
                                marker.link.split("/")[2]
                        }}</a>
                </small>
                <small>Last update:
                    <span :datetime="marker.updated_at">{{
                            marker.updated_at
                    }}</span>.
                </small>
                <small v-if="marker.elevation">Elevation:
                    {{ marker.elevation }} meters
                </small>
                <!-- <small v-if="isMarkerExpired(marker.expires_at)" >Expired:
            <span  :datetime="marker.expires_at">{{
                marker.expires_at
            }}</span>.</small> -->
                <!-- <details >
            <summary
              @click='searchLocation(marker.location.coordinates[0] + " " + marker.location.coordinates[1], false)'>
              Click to see address</summary>
            <p>{{ searchResults }}</p>
          </details> -->
                <a href="#"
                    role="button"
                    v-if="canDeleteMarker(marker)"
                    @click.prevent="deleteMarker(mapId, marker)">Delete</a>
                <!--
          <a  v-if="canMarkAsSpamPost(marker)" @click="markAsSpam(marker.id)"
            :disabled="submit_data.loading">Report as spam</a> -->
            </l-popup>
        </l-marker>

    </marker-cluster>

    <!-- </l-layer-group> -->
</template>