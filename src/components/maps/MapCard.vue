<script setup lang="ts">
import { useMapPosition } from '@/composables/mapPosition';
import { Marker } from '@/types/marker';
import { PropType, Ref, ref, watch } from 'vue';
import { useUser } from '@/composables/user';
import { useMarker } from '@/composables/marker';

const props = defineProps({
    marker: {
        type: Object as PropType<Marker>,
        required: true,
    },
})

const { center, zoom } = useMapPosition();

const handleClick = (marker: Marker) => {
    // Scroll to top of page when marker is clicked
    window.scrollTo(0, 0);

    //    Set the center

    center.value = {
        lat: marker.location.coordinates[1],
        lng: marker.location.coordinates[0],
    }

    zoom.value = marker.zoom ?? 16;
}

const user = useUser();
const markerComposable = useMarker();

const distance = ref(null) as Ref<number | null>;

const formattedDistance = ref("");

// Compute the distance from user using d=√((x2 – x1)² + (y2 – y1)²)
const computeDistance = (currentLocation: GeolocationCoordinates) => {
    const marker = props.marker;
    if (currentLocation) {
        return markerComposable.computeDistance(currentLocation.latitude, currentLocation.longitude, marker.location.coordinates[1], marker.location.coordinates[0]);
    }
    return null;
};

watch(user.currentLocation, (currentLocation) => {
    if (currentLocation) {
        distance.value = computeDistance(currentLocation);
    } else {
        distance.value = null;
        formattedDistance.value = "";
    }

    if (distance.value) {
        formattedDistance.value = markerComposable.formatDistance(distance.value);
    }
});
</script>

<template>
    <div class="card"
        @click="handleClick(marker)">
        <header>
            <h3>{{ marker.category.name }}</h3>
            <address style="color:var(--muted-color);margin-top:calc(var(--block-spacing-vertical) * -0.33)"
                v-if="marker.address">{{ marker.address }}</address>
        </header>
        <template v-if="marker.description">{{ marker.description }}</template>
        <footer>
            <time :datetime="marker.updated_at.toString()">{{ new Date(marker.updated_at).toLocaleString() }}</time>
            <div v-if="distance">{{ formattedDistance }} away</div>
        </footer>
    </div>
</template>
<style scoped>
.card {
    /* margin-top: calc(var(--block-spacing-vertical) / 2 * -1); */
    margin-bottom: calc(var(--block-spacing-vertical) * 0.33);
    padding: calc(var(--block-spacing-vertical) * .33) var(--block-spacing-horizontal);
    background-color: var(--card-background-color);
    border-radius: var(--border-radius);

    border-radius: var(--border-radius);
    background: var(--card-background-color);
    box-shadow: var(--card-box-shadow);

    cursor: pointer;
}

.card>header>h3 {
    margin-bottom: calc(var(--block-spacing-vertical) * 0.33);
}

.card footer {
    margin-top: calc(var(--block-spacing-vertical) * 0.33);
}
</style>