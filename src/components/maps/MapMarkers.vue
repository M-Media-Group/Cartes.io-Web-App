<script setup lang="ts">
import { useMarker } from '@/composables/marker';
import { Marker } from '@/types/marker';
import { PropType } from 'vue';
import {
    LMap,
    LIcon,
    LTileLayer,
    LMarker,
    LControlLayers,
    LTooltip,
    LPopup,
    LLayerGroup,
    LControl,
} from "@vue-leaflet/vue-leaflet";

defineProps({
    mapId: {
        type: String as PropType<string | number>,
        required: true,
    },
    markers: {
        type: Array as PropType<Marker[]>,
        required: true,
    },
})

const { canDeleteMarker, deleteMarker, canCreateMarker } = useMarker();

</script>

<template>
    <l-marker v-for="marker in markers"
        :lat-lng="[marker.location.coordinates[1], marker.location.coordinates[0]]"
        :key="marker.id + 'marker'">
        <l-icon :icon-url="marker.category.icon"
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
            <a v-if="canDeleteMarker(marker)"
                @click="deleteMarker(mapId, marker)">Delete</a>
            <!--
          <a  v-if="canMarkAsSpamPost(marker)" @click="markAsSpam(marker.id)"
            :disabled="submit_data.loading">Report as spam</a> -->
        </l-popup>
    </l-marker>
</template>