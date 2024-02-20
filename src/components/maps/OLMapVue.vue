<script setup lang="ts">
import { ref, PropType, defineAsyncComponent, computed, onMounted } from "vue";

import markerIcon from "/images/marker-01.svg";
import { Map } from "@/types/map";
import { useMapPosition } from "@/composables/mapPosition";
import { useMarker } from "@/composables/marker";
import { Marker } from "@/types/marker";
import { MapBrowserEvent, Overlay, View } from "ol";
import { useRouter } from "vue-router";
import userDevice from "@/classes/userDevice";

import Feature, { FeatureLike } from "ol/Feature";
import OLUserCurrentLocation from "./OLUserCurrentLocation.vue";
import OLMapTileLayers from "./OLMapTileLayers.vue";
import { Layer } from "ol/layer";
import { Icon, Style } from "ol/style";

// Import the OL Map for type
import OLMap from "ol/Map";
import BaseEvent from "ol/events/Event";
import { Item } from "ol-contextmenu";

const props = defineProps({
    showAr: {
        type: Boolean,
        default: false,
    },
    mapId: {
        // Type of either string, number, or null
        type: String,
        required: true,
    },
    map: {
        type: Object as PropType<Map | undefined>,
        required: false,
    },
    markers: {
        type: Array as PropType<Marker[]>,
        required: true,
    },
    cluster: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits([
    "addedMarker",
    "deletedMarker",
    "showAr",
    "ready",
    'openedContextMenu'
])

const { center, zoom, contextMenuPosition } = useMapPosition();

const { canDeleteMarker, deleteMarker, canCreateMarkerForMapByMapId } = useMarker();

const router = useRouter();

const projection = ref("EPSG:4326");
const rotation = ref(0);

const contextMenuItems = ref<Item[]>();
const view = ref<View>();

const parsedMetadata = ref(null as null | string);

const addMarkerForm = ref<typeof AddMarkerForm>();

const createMarkerPopup = ref<{ overlay: Overlay }>();

const map = ref<{ map: OLMap }>();

const selectedFeatures = ref<FeatureLike[]>([]);

const zoomLevel = ref(0);

contextMenuItems.value = [
    {
        text: "Center map here",
        classname: "some-style-class", // add some CSS rules
        callback: (val) => {
            view.value?.setCenter(val.coordinate);
        }, // `center` is your callback function
    },
    // Separator
    "-",
];

const emitReady = () => {
    emit('ready');
}

const openAddMarkerPopup = (event: MapBrowserEvent<PointerEvent>) => {
    // If the event target is a not a canvas element, do nothing. This prevents handling of clicks when the user clicks within an overlay
    if ((event.originalEvent.target as HTMLElement | null)?.tagName !== "CANVAS") {
        return;
    }

    if (!event.map) {
        return;
    }

    if (!event.coordinate) {
        return;
    }

    if (!createMarkerPopup.value) {
        return;
    }

    const overlay: Overlay = createMarkerPopup.value.overlay;

    // Get the actual coordinates. Because the world can wrap on the map, we need to get the lng from -180 to 180, not 0 to infinity. To do this, instead of event.coordinate[0], we use event.coordinate[0] % 180
    // @todo - this doesnt actually work, lng may still exceed 180. Solved for now by limiting map extent
    const coordinatesFromMap = map.value?.map.getEventCoordinate(event.originalEvent);

    overlay.setPosition(event.coordinate);

    // Even though we later use the event.coordinate to set the position of the popup, we need to set it here as well so that the marker form can use it
    contextMenuPosition.value = coordinatesFromMap ? {
        lng: coordinatesFromMap[0],
        lat: coordinatesFromMap[1],
    } : {
        lng: 0,
        lat: 0,
    }

    emit('openedContextMenu');
    if (canCreateMarkerForMapByMapId(props.mapId)) {
        if (!addMarkerForm.value) {
            return;
        }
        addMarkerForm.value.focusMultiselect();
    }
};

// Metadata can be either an array, or a key value pair of items
const parseMetadata = (meta: JSON) => {
    // @todo - Need to also handle recursive data

    if (Array.isArray(meta)) {
        return meta.join(", ");
    } else {
        return Object.entries(meta).map(([key, value]) => `${key}: ${value}`).join(", ");
    }
}

const handleMarkerClick = (marker: Marker) => {
    if (marker.meta) {
        parsedMetadata.value = parseMetadata(marker.meta);
    } else {
        parsedMetadata.value = null;
    }
}

const handleMarkerDelete = (marker: Marker) => {
    if (marker !== null && canDeleteMarker(marker)) {
        deleteMarker(props.mapId, marker);
        parsedMetadata.value = null;
    }
}

const handleNewMarkerEvent = (marker: Marker) => {
    emit('addedMarker', marker);
    if (!createMarkerPopup.value) {
        return;
    }
    const overlay: Overlay = createMarkerPopup.value.overlay;
    overlay.setPosition(undefined);
};

const AddMarkerForm = defineAsyncComponent(() =>
    import('@/components/AddMarkerForm.vue')
)

/**
 * Only handle click / hover for the layer with class name "feature-layer"
 */
function layerFilter(layerCandidate: Layer) {
    return layerCandidate.getClassName().includes("feature-layer");
}

/**
 * select features and combine them when shift key is pressed
 */
function selectFeature(event: MapBrowserEvent<PointerEvent>) {
    // If the event target is a not a canvas element, do nothing. This prevents handling of clicks when the user clicks within an overlay
    if ((event.originalEvent.target as HTMLElement | null)?.tagName !== "CANVAS") {
        return;
    }

    // reset selection when shift key isn't pressed
    if (!event.originalEvent.shiftKey) {
        selectedFeatures.value = [];
    }

    // store selected feature
    const features = map.value?.map?.getFeaturesAtPixel(event.pixel, {
        hitTolerance: 10,
        layerFilter,
    });

    if (!features?.length) {
        return openAddMarkerPopup(event);
    }

    // Hide the create marker popup
    if (createMarkerPopup.value?.overlay) {
        createMarkerPopup.value.overlay.setPosition(undefined);
    }

    const feature = features[0];
    const featureIndex = selectedFeatures.value.indexOf(feature);

    if (featureIndex == -1) {
        selectedFeatures.value.push(feature);
    } else {
        selectedFeatures.value.splice(featureIndex, 1);
    }

    const markerClickedOn = selectedFeatures.value[0].getProperties() as Marker;

    if (markerClickedOn) {
        handleMarkerClick(markerClickedOn);
    }
}

// A getter setter v-model for the center. It will save to center.lat and center.lng and will itself output an array of [lng, lat]
const centerLatLng = computed({
    get: () => {
        return [center.value.lng, center.value.lat];
    },
    set: (newValue) => {
        center.value = {
            lat: newValue[1],
            lng: newValue[0],
        };
    },
});

const icons = [] as Record<number, Icon>;

const overrideStyleFunction = (feature: Feature, style: Style) => {
    const categoryId = feature.get("category")?.id ?? 0;

    // If the icon is already in the icons array, use that one
    if (!icons[categoryId]) {
        const newIcon = new Icon({
            src: feature.get("category")?.icon ?? markerIcon,
            width: 32,
            height: 32,
            rotateWithView: true,
            crossOrigin: "anonymous",
        });

        // Save newIcon to the icons array by its category ID
        icons[categoryId] = newIcon;
    }

    return style.setImage(icons[categoryId]);
};

const componentType = computed(() => {
    return props.cluster ? "ol-animated-clusterlayer" : "ol-vector-layer";
});

// Go to /ar of the current map
const goToAr = () => {
    router.push(`/maps/${props.mapId}/ar`);
}

const handleViewChange = (event: BaseEvent) => {
    const newZoomLevel = event.target.getZoom();

    // If the zoom level is above 20, set it to 20
    if (newZoomLevel > 20) {
        zoomLevel.value = 20;
    } else {
        zoomLevel.value = newZoomLevel;
    }
}

// Close a given overlay
const closeOverlay = (overlay: Overlay) => {
    console.log(overlay);
    overlay.setPosition(undefined);
}

onMounted(() => {

    // // Create a new text search input element
    // const searchElement = document.createElement("input");

    // // Add a class to the element
    // searchElement.classList.add("ol-search");

    // // Add a text input control to the map
    // const searchControl = new Control({
    //     element: searchElement,
    // });
    // map.value?.map.addControl(searchControl);
});
</script>

<template>
    <ol-map ref="map"
        :loadTilesWhileAnimating="true"
        :loadTilesWhileInteracting="true"
        style="height: 80svh"
        @contextmenu="openAddMarkerPopup($event)"
        @singleclick="selectFeature"
        @postrender="emitReady">
        <ol-view ref="view"
            :center="centerLatLng"
            :rotation="rotation"
            :constrainRotation="true"
            :zoom="zoom"
            :projection="projection"
            :extent="[-180, -90, 180, 90]"
            @change="handleViewChange" />

        <OLMapTileLayers />

        <ol-toggle-control
            html='<svg width="24px" height = "24px" viewBox = "-1.5 -1 24 24"  xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M15.853 16.56c-1.683 1.517-3.911 2.44-6.353 2.44-5.243 0-9.5-4.257-9.5-9.5s4.257-9.5 9.5-9.5 9.5 4.257 9.5 9.5c0 2.442-.923 4.67-2.44 6.353l7.44 7.44-.707.707-7.44-7.44zm-6.353-15.56c4.691 0 8.5 3.809 8.5 8.5s-3.809 8.5-8.5 8.5-8.5-3.809-8.5-8.5 3.809-8.5 8.5-8.5z"/></svg>'
            :onToggle="() => { }"
            className="search-control" />

        <ol-toggle-control :html="'AR'"
            :onToggle="goToAr"
            className="ar-control"
            v-if="showAr && userDevice.supportsAr" />

        <component :is="componentType"
            :animationDuration="500"
            :distance="40"
            class-name="feature-layer"
            title="Markers">
            <ol-source-vector>
                <template v-for="marker in markers">

                    <ol-feature :properties="marker"
                        v-if="marker.location?.coordinates">
                        <ol-geom-point
                            :coordinates="[marker.location.coordinates[0], marker.location.coordinates[1]]"></ol-geom-point>
                    </ol-feature>

                </template>
            </ol-source-vector>
            <ol-style :overrideStyleFunction="overrideStyleFunction">

            </ol-style>

        </component>

        <ol-overlay positioning="bottom-center"
            :offset="[0, -10]"
            ref="createMarkerPopup">

            <a v-if="createMarkerPopup"
                href="#"
                role="button"
                @click.prevent="closeOverlay(createMarkerPopup.overlay)"
                class="closeButton">&times;</a>

            <AddMarkerForm v-if="canCreateMarkerForMapByMapId(mapId)"
                class="overlay-content"
                ref="addMarkerForm"
                :mapId="mapId"
                :markerLat="contextMenuPosition.lat"
                :markerLng="contextMenuPosition.lng"
                :allowLatLngElevationOverride="false"
                :showLinkInput="map?.options?.links ?? 'disabled'"
                :zoom="zoomLevel"
                @addedMarker="handleNewMarkerEvent($event)" />
            <div class="overlay-content"
                v-else-if="map?.users_can_create_markers === 'no'">Only the map owner can create markers on this map.
            </div>
            <div class="overlay-content"
                v-else>
                <router-link to="/login">Log in</router-link> to create markers on this map.
            </div>

        </ol-overlay>

        <template v-for="feature in selectedFeatures">
            <ol-overlay v-if="feature && feature.getGeometry()"
                :position="[feature.getGeometry()?.getFlatCoordinates()[0], feature.getGeometry()?.getFlatCoordinates()[1]]"
                positioning="bottom-center"
                :offset="[0, -10]">

                <a v-if="feature"
                    href="#"
                    role="button"
                    @click.prevent="selectedFeatures = []"
                    class="closeButton">&times;</a>

                <div class="overlay-content">
                    <p style="min-width: 200px">
                        <b>{{ feature.getProperties().category.name }}</b>
                    </p>
                    <p v-if="feature.getProperties().description"
                        v-html="feature.getProperties().description"></p>
                    <small v-if="feature.getProperties().link"><a :href="feature.getProperties().link"
                            target="blank">{{
                                feature.getProperties().link.split("/")[2]
                            }}</a>
                    </small>

                    <!-- <small v-if="isMarkerExpired(feature.getProperties().expires_at)" >Expired:
                    <span  :datetime="feature.getProperties().expires_at">{{
                        feature.getProperties().expires_at
                    }}</span>.</small> -->

                    <details>
                        <summary>Location</summary>
                        <!-- <p v-if="searchResults && searchResults[0] && searchResults[0].label">{{ searchResults[0].label }}
                            </p>
                            <p v-else:aria-busy="true">Searching</p> -->
                        <small v-if="feature.getProperties().elevation">Elevation:
                            {{ feature.getProperties().elevation }} meters
                        </small>
                        <small>Coordinates: {{ feature.getProperties().location.coordinates[1] }} {{
                            feature.getProperties().location.coordinates[0]
                        }}</small>
                        <small v-if="feature.getProperties().address">Address: {{ feature.getProperties().address }}</small>
                    </details>

                    <details v-if="parsedMetadata">
                        <summary>Metadata</summary>
                        <small>{{ parsedMetadata }}</small>
                    </details>

                    <a href="#"
                        role="button"
                        v-if="feature.getProperties() !== null && canDeleteMarker(feature.getProperties() as Marker)"
                        @click.prevent="handleMarkerDelete(feature.getProperties() as Marker)">Delete</a>

                    <hr v-if="feature.getProperties() && canDeleteMarker(feature.getProperties() as Marker)" />

                    <small v-if="feature.getProperties().updated_at">Last update:
                        <time :datetime="String(feature.getProperties().updated_at)">{{
                            new Date(feature.getProperties().updated_at).toLocaleString()
                        }}</time>
                    </small>
                    <small v-if="feature.getProperties().locations_count && feature.getProperties().locations_count > 1">
                        <span>Moved
                            {{ feature.getProperties().locations_count - 1 }} times</span>
                    </small>
                    <!-- <a v-if="canMarkAsSpamPost(marker)" @click="markAsSpam(feature.getProperties().id)" :disabled="submit_data.loading">Report as spam</a> -->
                </div>
            </ol-overlay>
        </template>

        <OLUserCurrentLocation />
    </ol-map>
</template>

<style>
/* Set the --ol-background-color: vars  */
:root,
:host {
    --ol-background-color: var(--background-color);
    --ol-accent-background-color: var(--primary-color);
    --ol-subtle-background-color: rgba(128, 128, 128, 0.25);
    --ol-partial-background-color: rgba(255, 255, 255, 0.75);
    --ol-foreground-color: var(--background-color);
    --ol-subtle-foreground-color: white;
    --ol-brand-color: var(--primary-color);
}

.overlay-content {
    background: var(--background-color);
    color: white;
    box-shadow: 0 5px 10px rgb(2 2 2 / 20%);
    padding: 10px 20px;

    border-radius: 16px;

    margin: 0;

    max-width: 450px;

}

.overlay-content>p {
    margin: 0;
}

.overlay-content::after {
    content: "";
    position: absolute;
    bottom: -10px;
    /* adjust this value to move the triangle up or down */
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    /* adjust this value to change the size of the triangle */
    border-right: 10px solid transparent;
    /* adjust this value to change the size of the triangle */
    border-top: 10px solid var(--background-color);
    /* adjust this value to change the size of the triangle */
}

.ol-layerswitcher-image>button,
ol-viewport .ol-layerswitcher>button,
.ol-control {
    background: transparent;
}

.ol-control.ol-location-control {
    left: 0.5em;
    top: 5em;
}

.location-active>button {
    background-color: var(--primary);

}

.ol-control.ar-control {
    position: absolute;
    right: 0.5em;
    text-align: left;
    top: 7em;
    transition: all 0.2s ease 0s;
    -webkit-transition: all 0.2s ease 0s;

}

.ol-control.search-control {
    left: 0.5em;
    top: 7em;
}

.closeButton {
    position: absolute;
    right: 0;
    top: 0.5rem;
    font-size: 1.5em;
    color: var(--primary-inverse);
    text-decoration: none;
    background: transparent;
    margin: 0;
    padding: 0.5rem;
    line-height: 0;
    border: none;
}

.ol-search {
    margin-left: 1rem;
    margin-right: 1rem;
    margin-top: 1rem;
    width: 100%;
}
</style>