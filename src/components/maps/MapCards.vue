<script setup lang="ts">
import { useMarker } from '@/composables/marker';
import { useUser } from '@/composables/user';
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

const user = useUser();

const marker = useMarker();

const orderBy = ref("updated_at" as "updated_at" | "created_at" | "distance");

// @todo - potentially refactor, this could be inefficient to compute each marker distance - need to performance test
const sortedMarkers = computed(() => {
    return props.markers.sort((a, b) => {
        if (orderBy.value === 'distance' && user.currentLocation.value) {
            return marker.computeDistance(user.currentLocation.value?.latitude, user.currentLocation.value?.longitude, a.location.coordinates[1], a.location.coordinates[0]) - marker.computeDistance(user.currentLocation.value?.latitude, user.currentLocation.value?.longitude, b.location.coordinates[1], b.location.coordinates[0]);
        } else if (orderBy.value !== 'distance') {
            return a[orderBy.value] < b[orderBy.value] ? 1 : -1;
        }
        return 0;
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
        <div class="inputs"
            v-if="sortedMarkers.length > 9">
            <input type="search"
                v-model="searchTerm"
                :placeholder="'Search ' + sortedMarkers.length + ' markers'" />
            <select v-model="orderBy"
                placeholder="Order by">
                <optgroup label="Order by">
                    <option value="updated_at">Updated at</option>
                    <option value="created_at">Created at</option>
                    <option :disabled="!user.currentLocation.value"
                        value="distance">Distance from you</option>
                </optgroup>
            </select>
        </div>
        <MapCard v-for="marker in filteredMarkers"
            :key="marker.id"
            :marker="marker" />
    </div>
    <div v-else>No markers yet</div>
</template>
<style scoped>
.inputs {
    display: inline-flex;
    gap: var(--spacing);
}

.inputs input {
    flex: 2.5;
}

.inputs select {
    flex: 1;
}
</style>