<script setup lang="ts">
import { useMap } from '@/composables/map';
import { useMapPosition } from '@/composables/mapPosition';
import { Map } from '@/types/map';
import { defineAsyncComponent, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';
import MapAuthor from './maps/MapAuthor.vue';

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
        <header v-if="showLoader"
            class="full loader">
        </header>
        <header class="full"
            v-if="map.markers_count && map.markers_count > 0">
            <NewMapComponent v-if="showMap"
                v-show="!showLoader"
                :mapId="map.uuid"
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
        <p v-if="showDescription">{{ map.description }}</p>
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

.loader {
    height: 400px;
    animation: 1.5s shine linear infinite;
    background: var(--background-color);
    background: linear-gradient(110deg, var(--background-color) 8%, var(--card-background-color) 18%, var(--background-color) 33%);
    background-size: 200% 100%;
}

/* Loader keyframes card loading */
@keyframes shine {
    to {
        background-position-x: -200%;
    }
}
</style>