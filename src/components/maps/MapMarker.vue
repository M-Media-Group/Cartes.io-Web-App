<script setup lang="ts">
import { Marker } from '@/types/marker';
import { inject, PropType } from 'vue';
import {
    LIcon,
    LMarker,
    LCircleMarker,
} from "@vue-leaflet/vue-leaflet";
import $bus, { eventTypes } from "@/eventBus/events";
import { useMarker } from '@/composables/marker';

const { canDeleteMarker, updateMarker } = useMarker();

const props = defineProps({
    mapId: {
        type: String,
        required: true,
    },
    marker: {
        type: Object as PropType<Marker>,
        required: true,
    },
})

const emit = defineEmits(['clicked']);

const handleMarkerClick = (marker: Marker) => {
    $bus.$emit(eventTypes.opened_marker_popup, marker);
    emit('clicked', marker);
}

const handleMarkerDragEnd = (event: any, marker: Marker) => {
    const newPosition = event.target.getLatLng();
    if (!marker.location) {
        marker.location = {
            type: 'Point',
            coordinates: [newPosition.lng, newPosition.lat],
        };
    }
    marker.location.coordinates = [newPosition.lng, newPosition.lat];
    updateMarker(props.mapId, marker);
    $bus.$emit(eventTypes.dragged_marker, marker);
}

const preferCanvas = false; // inject('preferCanvas', false);

const componentToUse = preferCanvas ? LCircleMarker : LMarker;

</script>

<template>
    <component :is="componentToUse"
        :radius="7"
        :lat-lng="[marker.location?.coordinates[1], marker.location?.coordinates[0]]"
        :key="'map-' + mapId + '|' + marker.id + '-marker'"
        :draggable="!!canDeleteMarker(marker)"
        @dragend="handleMarkerDragEnd($event, marker)"
        @click="handleMarkerClick(marker)">
        <l-icon :icon-url="marker.category?.icon ?? '/images/marker-01.svg'"
            :icon-size="[30, 30]"
            :icon-anchor="[15, 25]" />
    </component>
</template>
