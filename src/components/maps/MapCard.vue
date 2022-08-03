<script setup lang="ts">
import { useMapPosition } from '@/composables/mapPosition';
import { Category as CategoryType } from '@/types/category';
import { Marker } from '@/types/marker';
import { PropType } from 'vue';

defineProps({
    //   Define the props as from the marker.ts declaration
    category: {
        type: Object as PropType<CategoryType>,
        required: true,
    },
    description: {
        type: String as PropType<string | number | null>,
        required: false,
    },
    link: {
        type: String as PropType<string | number | null>,
        required: false,
    },
    elevation: {
        type: Number as PropType<number | string | null>,
        required: false,
    },
    created_at: {
        type: String as PropType<string | Date>,
        required: true,
    },
    updated_at: {
        type: String as PropType<string | Date>,
        required: true,
    },
    id: {
        type: Number,
        required: true,
    },
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

    zoom.value = 16;
}
</script>

<template>
    <div class="card"
        @click="handleClick(marker)">
        <header>
            <h3>{{ category.name }}</h3>
        </header>
        <template v-if="description">{{ description }}</template>
        <footer>
            <time :datetime="created_at.toString()">{{ new Date(created_at).toLocaleString() }}</time>
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