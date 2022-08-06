<script setup lang="ts">
import { Map } from '@/types/map.js';
import { PropType } from 'vue';
import NewMapComponent from '@/components/maps/NewMapComponent.vue';

defineProps({
    map: {
        type: Object as PropType<Map>,
        required: true,
    },
    showMap: {
        type: Boolean,
        default: true,
    },
});

</script>
<template>
    <article :key="map.uuid">
        <header class="full"
            v-if="map.markers_count && map.markers_count > 0">
            <NewMapComponent v-if="showMap"
                :mapId="map.uuid"
                :map="map"
                :markers="map.markers ?? []"
                style="height: 400px" />
        </header>
        <h3>{{ map.title ?? "Untitled map" }}</h3>
        <p>{{ map.description }}</p>
        <router-link :to="'/maps/' + map.uuid"
            custom
            v-slot="{ navigate }">
            <button @click="navigate">Open map</button>
        </router-link>
        <footer>
            <small>{{ map.markers_count }} live markers</small>
        </footer>
    </article>
</template>
<style scoped>
article>header.full {
    padding: 0;
    /* margin-bottom: calc(var(--block-spacing-vertical) *0.5); */
}

/* The first article child of a section */
article {
    margin-top: 0;
}

h3 {

    margin-bottom: var(--spacing);
}
</style>