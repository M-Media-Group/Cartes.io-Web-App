<script setup lang="ts">
import { Map } from '@/types/map';
import { defineAsyncComponent, PropType } from 'vue';

defineProps({
    map: {
        type: Object as PropType<Map>,
        required: true,
    },
    showMap: {
        type: Boolean,
        default: true,
    },
    showDescription: {
        type: Boolean,
        default: true,
    },
    showFooter: {
        type: Boolean,
        default: true,
    },
});

const NewMapComponent = defineAsyncComponent(() =>
    import('@/components/maps/NewMapComponent.vue')
)

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
        <p v-if="showDescription">{{ map.description }}</p>
        <BaseButton :to="'/maps/' + map.uuid">Open map</BaseButton>
        <footer v-if="showFooter && map.markers_count">
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