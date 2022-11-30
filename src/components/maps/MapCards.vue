<script setup lang="ts">
import { Marker } from '@/types/marker';
import { computed, PropType, ref } from 'vue';
import MapCard from './MapCard.vue';

const props = defineProps({
    markers: {
        type: Array as PropType<Marker[]>,
        required: true,
    },
})

const searchTerm = ref("");

const sortedMarkers = computed(() => {
    return props.markers.sort((a, b) => {
        return a.updated_at < b.updated_at ? 1 : -1;
    });
});

const filteredMarkers = computed(() => {
    return sortedMarkers.value.filter(marker => {
        return marker.description?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            marker.category.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            marker.address?.toLowerCase().includes(searchTerm.value.toLowerCase());
    });
})
</script>

<template>
    <div style="max-height: 57vh;overflow-y: scroll;"
        v-if="sortedMarkers.length > 0">
        <input type="search"
            v-model="searchTerm"
            :placeholder="'Search ' + sortedMarkers.length + ' markers'"
            v-if="sortedMarkers.length > 9" />
        <MapCard v-for="marker in filteredMarkers"
            :key="marker.id"
            :marker="marker" />
    </div>
    <div v-else>No markers yet</div>
</template>