<script setup lang="ts">
import { useMarker } from '@/composables/marker';
import { Marker } from '@/types/marker';
import { PropType } from 'vue';
import {
    LIcon,
    LMarker,
    LPopup,
} from "@vue-leaflet/vue-leaflet";
import $bus, { eventTypes } from "@/eventBus/events";

defineProps({
    mapId: {
        type: String,
        required: true,
    },
    marker: {
        type: Object as PropType<Marker>,
        required: true,
    },
})

const { canDeleteMarker, deleteMarker } = useMarker();

const handleMarkerClick = (marker: Marker) => {
    $bus.$emit(eventTypes.opened_marker_popup, marker);
}

</script>

<template>
    <l-marker :lat-lng="[marker.location.coordinates[1], marker.location.coordinates[0]]"
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

            <!-- <small v-if="isMarkerExpired(marker.expires_at)" >Expired:
            <span  :datetime="marker.expires_at">{{
                marker.expires_at
            }}</span>.</small> -->

            <details>
                <summary>Location</summary>
                <!-- <p v-if="searchResults && searchResults[0] && searchResults[0].label">{{ searchResults[0].label }}
                    </p>
                    <p v-else:aria-busy="true">Searching</p> -->
                <small v-if="marker.elevation">Elevation:
                    {{ marker.elevation }} meters
                </small>
                <small>Coordinates: {{ marker.location.coordinates[1] }} {{ marker.location.coordinates[0]
                }}</small>
            </details>

            <a href="#"
                role="button"
                v-if="canDeleteMarker(marker)"
                @click.prevent="deleteMarker(mapId, marker)">Delete</a>

            <hr v-if="canDeleteMarker(marker)" />

            <small>Last update:
                <span :datetime="marker.updated_at">{{
                        marker.updated_at
                }}</span>.
            </small>
            <!--
          <a  v-if="canMarkAsSpamPost(marker)" @click="markAsSpam(marker.id)"
            :disabled="submit_data.loading">Report as spam</a> -->
        </l-popup>
    </l-marker>


</template>
<style scoped>
small {
    display: block;
}
</style>