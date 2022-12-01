<script setup lang="ts">
import { useMap } from '@/composables/map';
import { useMapPosition } from '@/composables/mapPosition';
import { Map } from '@/types/map';
import { defineAsyncComponent, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';
import MapAuthor from './maps/MapAuthor.vue';
import MapLoader from "@/components/maps/MapLoader.vue";

import Markdown from 'vue3-markdown-it';

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
        default: false,
    },
});

const NewMapComponent = defineAsyncComponent(() =>
    import('@/components/maps/NewMapComponent.vue')
)

const MapInstance = useMap();

const router = useRouter();

const mapPosition = useMapPosition();

const handleClick = () => {
    if (props.clickable === true) {
        goToMap();
    }
}

const goToMap = () => {
    router.push({
        path: '/maps/' + props.map.uuid,
        query: {
            lat: mapPosition.center.value.lat,
            lng: mapPosition.center.value.lng,
            zoom: mapPosition.zoom.value,
        },
    });
}

const showLoader = ref(true)

</script>
<template>
    <article :key="map.uuid"
        @click="handleClick()">
        <header class="full"
            v-if="showMap">
            <MapLoader v-if="showLoader"
                style="height: 400px"></MapLoader>
        </header>
        <header class="full"
            v-if="showMap && map.markers_count && map.markers_count > 0"
            v-show="!showLoader">
            <NewMapComponent :mapId="map.uuid"
                :map="map"
                :markers="map.markers ?? []"
                style="height: 400px"
                @ready="showLoader = false" />
        </header>
        <BaseHeading as="h3"
            :title='map.title ?? "Untitled map"'>
            <template #subtitle>
                <p>
                    <template v-if="map.active_markers_count">
                        {{ map.active_markers_count }} / {{ map.markers_count }} active
                    </template>
                    <template v-else>
                        {{ map.markers_count }}
                    </template>
                    markers •
                    <MapAuthor :map="map" />
                </p>
            </template>
        </BaseHeading>
        <Markdown v-if="showDescription"
            :source="map.description"
            :linkify="true"
            class="markdown" />
        <BaseButton v-if="showAction"
            @click="goToMap()">Open map</BaseButton>
        <small v-if="MapInstance.wouldLinkToCurrentUser(map)">{{ "This map is linked to you only through this device."
        }}
        </small>

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
article> :last-child:not(footer) {
    margin-bottom: 0;
}
</style>