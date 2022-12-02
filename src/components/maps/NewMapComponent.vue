
<script setup lang="ts">
import { Marker } from "@/types/marker";
import {
  LMap,
  LTileLayer,
  LControlLayers,
  LPopup,
  LLayerGroup,
  LControl,
  LControlAttribution,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

import MapMarkers from "./MapMarkers.vue";

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

import { defineAsyncComponent, nextTick, PropType, ref, watch } from "vue";
import { useMarker } from "@/composables/marker";
import userDevice from "@/classes/userDevice";
import { useMapPosition } from "@/composables/mapPosition";
import { Map } from "@/types/map";
import BaseSvg from "@/components/icons/BaseSvg.vue";
import MapLoader from "@/components/maps/MapLoader.vue";
import { useUser } from "@/composables/user";

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
    default: true,
  },
})

const emit = defineEmits([
  "addedMarker",
  "deletedMarker",
  "showAr",
  "ready",
  'openedContextMenu'
])

const user = useUser();

const ready = ref(false);

const mapElement = ref();

const leafletObject = ref();

const addMarkerPopup = ref();

const addMarkerForm = ref<any>();

const { center, zoom, contextMenuPosition, maxBounds, goToDeviceLocation } = useMapPosition();

const { canCreateMarkerForMapByMapId } = useMarker();

const openAddMarkerPopup = (event: { latlng: any; }) => {
  if (addMarkerPopup.value && event.latlng) {
    contextMenuPosition.value = event.latlng;
    addMarkerPopup.value.leafletObject.openPopup(contextMenuPosition.value);
    emit('openedContextMenu');
    if (canCreateMarkerForMapByMapId(props.mapId)) {
      addMarkerForm.value.focusMultiselect();
    }
  }
};

const handleNewMarkerEvent = (event: Marker) => {
  emit('addedMarker', event);
  addMarkerPopup.value.leafletObject.closePopup();
};


const provider = new OpenStreetMapProvider();

const geosearchControlOptions = {
  provider: provider,
  showMarker: false, // optional: true|false  - default true
  autoClose: true, // optional: true|false  - default false
  updateMap: false, // optional: true|false  - default true
  keepResult: true, // optional: true|false  - default false
};

const searchControl = new (GeoSearchControl as any)(geosearchControlOptions);

// const searchResults = ref();

// const searchLocation = async (string: string, goTo = true) => {
//   if (string) {
//     const results = await provider.search({ query: string });
//     searchResults.value = results;

//     if (results.length > 0) {
//       if (goTo) {
//         goToLocation({ location: results[0] });
//       }
//     }
//     return results;
//   }
// };

// provide('searchLocation', searchLocation);
// provide('searchResults', searchResults);

//Bounds set slightly higher than actual world max to create a "padding" on the map
watch(ready, () => {
  leafletObject.value.addControl(searchControl);
  leafletObject.value.on('geosearch/showlocation', goToLocation);
});

const goToLocation = async (event: { location: any; }) => {
  const result = await event.location;
  center.value = { lat: result.y, lng: result.x };
  // Count how many decimal places there are in the lat/lng, and zoom in accordingly
  const latDecimalPlaces = result.y.toString().split('.')[1].length;
  const lngDecimalPlaces = result.x.toString().split('.')[1].length;
  zoom.value = Math.max(latDecimalPlaces, lngDecimalPlaces) + 3;
};

const setReady = async () => {
  await nextTick();
  ready.value = true;
  leafletObject.value = mapElement.value.leafletObject;
  // Emit
  emit('ready', mapElement.value.leafletObject);

  // Wait for next tick to make sure the map is ready and let v-show trigger to true
  await nextTick();

  // Recompute leaflet bounds
  leafletObject.value.invalidateSize();
};

// Theres some problem with marker clustering when importing mapmarkers async
// const MapMarkers = defineAsyncComponent(() =>
//   import('@/components/maps/MapMarkers.vue')
// )

const AddMarkerForm = defineAsyncComponent(() =>
  import('@/components/AddMarkerForm.vue')
)

</script>
<template>
  <div style="background:gray;">
    <MapLoader v-if="!ready"></MapLoader>
    <l-map :maxBoundsViscosity="1.0"
      :worldCopyJump="true"
      style="width: 100%; height: 100%"
      class="disable-select"
      ref="mapElement"
      v-model:max-bounds="maxBounds"
      :maxZoom="19"
      v-model:zoom="zoom"
      v-model:center="center"
      @contextmenu="openAddMarkerPopup($event)"
      @ready="setReady"
      :options="{ attributionControl: false, preferCanvas: true }"
      :zoomAnimation="true"
      :fadeAnimation="true"
      :markerZoomAnimation="true"
      :noBlockingAnimations="true"
      v-show="ready">

      <l-control-attribution position="bottomright"
        prefix='&copy; <a href="https://cartes.io">Cartes.io</a> &copy; <a href="https://icons8.com/attributions">Icons8</a>'>
      </l-control-attribution>

      <l-control-layers />

      <l-control position="topleft"
        class="leaflet-control-ar leaflet-bar leaflet-control"
        v-if="userDevice.supportsGeolocation">
        <a href="#"
          aria-label="Go to your current location"
          @click.prevent="user.toggleLocationTracking()"
          :style="'background-color:' + (user.locationWatcherId.value ? 'var(--primary)' : '')">
          <BaseSvg icon="gps"
            style="padding:4px;" />
        </a>
      </l-control>

      <l-tile-layer name="Street"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
        layer-type="base"
        :max-zoom="19">
      </l-tile-layer>

      <l-tile-layer name="Topology"
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        :visible="false"
        layer-type="base"
        :max-zoom="17">
      </l-tile-layer>

      <l-tile-layer name="Satellite"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN,
      IGP, UPR-EGP, and the GIS User Community'
        :visible="false"
        layer-type="base"
        :max-zoom="19">
      </l-tile-layer>

      <!-- <l-locatecontrol /> -->

      <l-layer-group ref="addMarkerPopup">
        <l-popup class="unset-select">
          <AddMarkerForm v-if="canCreateMarkerForMapByMapId(mapId)"
            ref="addMarkerForm"
            :mapId="mapId"
            :markers="markers"
            :markerLat="contextMenuPosition.lat"
            :markerLng="contextMenuPosition.lng"
            :allowLatLngElevationOverride="false"
            :showLinkInput="map?.options?.links ?? 'disabled'"
            @addedMarker="handleNewMarkerEvent($event)" />
          <div v-else-if="map?.users_can_create_markers === 'no'">Only the map owner can create markers on this map.
          </div>
          <div v-else>
            <router-link to="/login">Log in</router-link> to create markers on this map.
          </div>
        </l-popup>
      </l-layer-group>

      <l-control class="leaflet-control-ar leaflet-bar leaflet-control"
        v-if="showAr && userDevice.supportsAr">
        <router-link :to="'/maps/' + mapId + '/ar'">
          AR
        </router-link>
      </l-control>

      <MapMarkers v-if="mapId && markers.length > 0"
        :mapId="mapId"
        :markers="markers"
        :cluster="cluster"></MapMarkers>
    </l-map>
  </div>
</template>

<style>
@import 'leaflet-geosearch/dist/geosearch.css';

.geosearch form input:not([type=checkbox]):not([type=radio]) {
  margin-bottom: 0;
  font-size: inherit;
}

.disable-select {
  user-select: none;
  /* supported by Chrome and Opera */
  -webkit-user-select: none;
  /* Safari */
  -khtml-user-select: none;
  /* Konqueror HTML */
  -moz-user-select: none;
  /* Firefox */
  -ms-user-select: none;
  /* Internet Explorer/Edge */
}

.disable-select .leaflet-popup,
.unset-select {
  user-select: auto;
  /* supported by Chrome and Opera */
  -webkit-user-select: auto;
  /* Safari */
  -khtml-user-select: auto;
  /* Konqueror HTML */
  -moz-user-select: auto;
  /* Firefox */
  -ms-user-select: auto;
  /* Internet Explorer/Edge */
}

.w-100 {
  width: 100%;
  display: block;
}

.leaflet-touch .leaflet-bar a,
.leaflet-control {
  padding: inherit;
  border: none;
}

.leaflet-control section {
  margin-bottom: initial;
}

.leaflet-popup-content-wrapper,
.leaflet-popup-tip,
.leaflet-bar a,
.leaflet-control-layers-toggle,
.leaflet-control-geosearch form,
.leaflet-control-geosearch .results.active,
.leaflet-control-geosearch a.reset,
.leaflet-control-layers {
  background-color: var(--card-background-color);
  color: inherit;
}

.leaflet-control-layers-list {
  padding: calc(var(--block-spacing-vertical) * .1) var(--block-spacing-horizontal);
}

.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
  color: inherit;
}

.leaflet-marker-icon {
  background-color: unset;
  border: unset;
}

.leaflet-popup a {
  color: var(--color);
}

.leaflet-control-geosearch a.leaflet-bar-part:after,
.leaflet-control-geosearch a.leaflet-bar-part:before {
  border-color: inherit;
}
</style>