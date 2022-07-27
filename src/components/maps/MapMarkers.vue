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
        :lat-lng="marker.location.coordinates"
        :key="marker.id + 'marker'">
        <l-icon :icon-url="marker.category.icon"
            :icon-size="[30, 30]"
            :icon-anchor="[15, 25]" />
        <l-popup class="unset-select">
            <p class="w-100"
                style="min-width: 200px">
                <b>{{ marker.category.name }}</b>
            </p>
            <p class="w-100"
                v-if="marker.description"
                v-html="marker.description"></p>
            <small class="w-100"
                v-if="marker.link"><a :href="marker.link"
                    target="blank">{{
                            marker.link.split("/")[2]
                    }}</a>
            </small>
            <small class="w-100">Last update:
                <span class="timestamp"
                    :datetime="marker.updated_at">{{
                            marker.updated_at
                    }}</span>.
            </small>
            <small class="w-100"
                v-if="marker.elevation">Elevation:
                {{ marker.elevation }} meters
            </small>
            <!-- <small v-if="isMarkerExpired(marker.expires_at)" class="w-100">Expired:
            <span class="timestamp" :datetime="marker.expires_at">{{
                marker.expires_at
            }}</span>.</small> -->
            <!-- <details class="small">
            <summary
              @click='searchLocation(marker.location.coordinates[0] + " " + marker.location.coordinates[1], false)'>
              Click to see address</summary>
            <p>{{ searchResults }}</p>
          </details> -->
            <a class="btn btn-link btn-sm text-danger"
                v-if="canDeleteMarker(marker)"
                @click="deleteMarker(mapId, marker)">Delete</a>
            <!--
          <a class="btn btn-link btn-sm text-warning" v-if="canMarkAsSpamPost(marker)" @click="markAsSpam(marker.id)"
            :disabled="submit_data.loading">Report as spam</a> -->
        </l-popup>
    </l-marker>
</template>