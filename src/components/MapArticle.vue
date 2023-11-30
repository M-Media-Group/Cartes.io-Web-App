<script setup lang="ts">
import { useMap } from '@/composables/map';
import { useMapPosition } from '@/composables/mapPosition';
import { Map } from '@/types/map';
import { defineAsyncComponent, onBeforeUnmount, PropType, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import MapAuthor from './maps/MapAuthor.vue';
import MapLoader from "@/components/maps/MapLoader.vue";

import Markdown from 'vue3-markdown-it';
import { useIntersectionObserver } from '@/composables/observer';

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
    hideMapWhenNotVisible: {
        type: Boolean,
        default: false,
    },
    showAsCard: {
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

const isFrozen = ref(props.hideMapWhenNotVisible);
const article = ref();

// If hideMapWhenNotVisible is set, we need to hide the map if its not in view to increase performance
// We do this by using an intersection observer
const setVisibilityTimeout = ref(null as ReturnType<typeof setTimeout> | null);

// We need a function that will set shouldShowAsUnfrozen to the value of isFrozen after 1 second, if isFrozen has remained unchanged
const toggleIsFrozen = (value: boolean) => {
    // Clear and restart the timeout everytime this function is called
    if (setVisibilityTimeout.value !== null) {
        clearTimeout(setVisibilityTimeout.value);
    }

    // If the value is the same as isFrozen, do nothing
    if (value === isFrozen.value) {
        return;
    }

    setVisibilityTimeout.value = setTimeout(() => {
        isFrozen.value = value;
        console.log("Called to set isFrozen to " + value);
    }, 100);
}

// Note that using an if statement here isnt the best practice because it makes any code within not reactive, but for our current use case its ok. To refactor later.
if (props.hideMapWhenNotVisible) {

    onMounted(() => {
        observeElement(article.value,
            (entry) => {
                if (entry.isIntersecting) {
                    toggleIsFrozen(false);
                } else {
                    toggleIsFrozen(true);
                }
            }
        );
    });
}

const { observeElement, unobserveElement } = useIntersectionObserver();

// We need to set a dynamic ref shouldShowAsUnfrozen - which will be the value of isFrozen if this value has remained unchanged for 1 second. This will prevent loading the map when its scrolled into view for a split second.
const shouldShowAsUnfrozen = ref(isFrozen.value ?? false);

</script>
<template>
    <article :key="'map-' + map.uuid"
        ref="article"
        @click="handleClick()"
        :class="{ 'card': showAsCard }">
        <template v-if="!showAsCard">
            <header class="full"
                v-if="showMap">
                <MapLoader v-if="showLoader || isFrozen"
                    style="height: 400px"></MapLoader>
            </header>
            <header class="full"
                v-if="showMap && map.markers_count && map.markers_count > 0 && !isFrozen"
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
            <small v-if="MapInstance.wouldLinkToCurrentUser(map)">{{
                "This map is linked to you only through this device."
            }}
            </small>
        </template>
        <template v-else>

            <NewMapComponent v-if="showMap && map.markers_count && map.markers_count > 0 && !isFrozen"
                :mapId="map.uuid"
                :map="map"
                :markers="map.markers ?? []"
                style="height: 450px"
                @ready="showLoader = false" />
            <MapLoader v-else-if="showLoader || isFrozen"
                style="height: 450px"></MapLoader>
            <BaseHeading as="h3"
                :title='map.title ?? "Untitled map"'
                @click="goToMap()"
                aria-label="Open map"
                aria-role="button">
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
        </template>
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

article.card {
    padding: 0;
    margin: 0;
    position: relative;
    scroll-snap-align: start;
}

.card .headings {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.5rem;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
    color: var(--primary-inverse) !important;
    z-index: 1000;
    padding-top: 3rem;
    padding-bottom: 1rem;
    padding-left: 1rem;
    padding-right: 1rem;
}

.card .headings * {
    color: var(--primary-inverse) !important;
}
</style>