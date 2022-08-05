<script setup lang="ts">
import { Marker } from '@/types/marker';
import { computed, PropType } from 'vue';
import MapCard from './MapCard.vue';

const props = defineProps({
    markers: {
        type: Array as PropType<Marker[]>,
        required: true,
    },
})

const sortedMarkers = computed(() => {
    return props.markers.sort((a, b) => {
        return a.created_at < b.created_at ? 1 : -1;
    });
});
</script>

<template>
    <div style="max-height: 57vh;overflow-y: scroll;"
        v-if="sortedMarkers.length > 0">
        <MapCard v-for="marker in sortedMarkers"
            :key="marker.id"
            :marker="marker" />
    </div>
    <div v-else>No markers yet</div>
</template>