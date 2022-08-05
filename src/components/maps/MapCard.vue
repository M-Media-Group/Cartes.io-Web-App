<script setup lang="ts">
import { useMapPosition } from '@/composables/mapPosition';
import { Marker } from '@/types/marker';
import { PropType } from 'vue';

defineProps({
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

    console.log(marker.location, center.value)

    zoom.value = 16;
}
</script>

<template>
    <div class="card"
        @click="handleClick(marker)">
        <header>
            <h3>{{ marker.category.name }}</h3>
        </header>
        <template v-if="marker.description">{{ marker.description }}</template>
        <footer>
            <time :datetime="marker.created_at.toString()">{{ new Date(marker.created_at).toLocaleString() }}</time>
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
}

.card>header>h3 {
    margin-bottom: calc(var(--block-spacing-vertical) * 0.33);
}

.card footer {
    margin-top: calc(var(--block-spacing-vertical) * 0.33);
}
</style>