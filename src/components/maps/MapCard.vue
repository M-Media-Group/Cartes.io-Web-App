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

const bearing = ref(null) as Ref<number | null>;

const formattedDistance = ref("");

const formattedBearing = ref("");

// Compute the distance from user using d=√((x2 – x1)² + (y2 – y1)²)
const computeDistance = (currentLocation: GeolocationCoordinates) => {
    const marker = props.marker;
    if (currentLocation) {
        return markerComposable.computeDistance(currentLocation.latitude, currentLocation.longitude, marker.location.coordinates[1], marker.location.coordinates[0]);
    }
    return null;
};

const computeBearing = (currentLocation: GeolocationCoordinates) => {
    const marker = props.marker;
    if (currentLocation) {
        return markerComposable.computeBearing(currentLocation.latitude, currentLocation.longitude, marker.location.coordinates[1], marker.location.coordinates[0]);
    }
    return null;
};

watch(user.currentLocation, (currentLocation) => {
    if (currentLocation) {
        distance.value = computeDistance(currentLocation);
        bearing.value = computeBearing(currentLocation);
    } else {
        distance.value = null;
        bearing.value = null;
        formattedDistance.value = "";
    }

    if (distance.value) {
        formattedDistance.value = markerComposable.formatDistance(distance.value);
    }

    if (bearing.value) {
        formattedBearing.value = markerComposable.formatBearing(bearing.value);
    }
});
</script>

<template>
    <div class="card"
        @click="handleClick(marker)">
        <header>
            <h3>{{ marker.category.name }}</h3>
            <address style="color:var(--pico-muted-color);margin-top:calc(var(--pico-block-spacing-vertical) * -0.33)"
                v-if="marker.address">{{ marker.address }}</address>
        </header>
        <template v-if="marker.description">{{ marker.description }}</template>
        <footer>
            <div><a :href="marker.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    v-if="marker.link">{{ marker.link.split("/")[2] }}</a></div>
            <time :datetime="marker.updated_at.toString()">{{ new Date(marker.updated_at).toLocaleString() }}</time>
            <div v-if="distance">{{ formattedDistance }} {{ formattedBearing }} of you</div>
        </footer>
    </div>
</template>
<style scoped>
.card {
    /* margin-top: calc(var(--pico-block-spacing-vertical) / 2 * -1); */
    margin-bottom: calc(var(--pico-block-spacing-vertical));
    padding: calc(var(--pico-block-spacing-vertical)) var(--pico-block-spacing-horizontal);
    background-color: var(--pico-card-background-color);
    border-radius: var(--pico-border-radius);

    border-radius: var(--pico-border-radius);
    background: var(--pico-card-background-color);
    box-shadow: var(--pico-card-box-shadow);

    cursor: pointer;
}

.card>header>h3 {
    margin-bottom: calc(var(--pico-block-spacing-vertical) * 0.33);
}

.card footer {
    margin-top: calc(var(--pico-block-spacing-vertical) * 0.33);
}
</style>