<script setup lang="ts">
import { useMap } from '@/composables/map.js';
import { Map } from '@/types/map';
import { defineAsyncComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
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
    showAction: {
        type: Boolean,
        default: true,
    },
    clickable: {
        type: Boolean,
        default: true,
    },
});

const NewMapComponent = defineAsyncComponent(() =>
    import('@/components/maps/NewMapComponent.vue')
)

const MapInstance = useMap();

const router = useRouter();

const handleClick = () => {
    if (props.clickable) {
        router.push('/maps/' + props.map.uuid);
    }
}

</script>
<template>
    <article :key="map.uuid"
        @click="handleClick()">
        <header class="full"
            v-if="map.markers_count && map.markers_count > 0">
            <NewMapComponent v-if="showMap"
                :mapId="map.uuid"
                :map="map"
                :markers="map.markers ?? []"
                style="height: 400px" />
        </header>
        <BaseHeading as="h3"
            :title='map.title ?? "Untitled map"' />
        <p v-if="showDescription">{{ map.description }}</p>
        <BaseButton v-if="showAction && !clickable"
            :to="'/maps/' + map.uuid">Open map</BaseButton>
        <small v-if="MapInstance.wouldLinkToCurrentUser(map)">{{ "This map is linked to you only through this device."
        }}
        </small>
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

/* If its the last element of the article except the footer, set margin 0 */
article :last-child:not(footer) {
    margin-bottom: 0;
}
</style>