
<script setup lang="ts">
import { Marker } from "@/types/marker";
import {
  LMap,
  LIcon,
  LTileLayer,
  LMarker,
  LControlLayers,
  LTooltip,
  LPopup,
  LLayerGroup,
  LControl,
  LControlAttribution,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

import AddMarkerForm from "@/components/AddMarkerForm.vue";

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

import { computed, nextTick, PropType, ref, watch } from "vue";
import { useMarker } from "@/composables/marker";
import { useUrlPositionParameters } from "@/composables/urlPositionParameters";
import userDevice from "@/classes/userDevice";
import MapMarker from "./MapMarker.vue";
import MapMarkers from "./MapMarkers.vue";

const isOnline = computed(() => {
  return userDevice.online;
});

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
  markers: {
    type: Array as PropType<Marker[]>,
    required: true,
  },
})

const emit = defineEmits([
  "addedMarker",
  "deletedMarker",
  "showAr"
])

const ready = ref(false);

const map = ref();

const leafletObject = ref();

const addMarkerPopup = ref();

const addMarkerForm = ref<any>();

const canPost = "only_logged_in";

const { setUrlPositionParameters, getUrlPositionParameters } = useUrlPositionParameters();

const zoom = ref(getUrlPositionParameters()['zoom'] || 2);
const center = ref({ lat: getUrlPositionParameters()['lat'], lng: getUrlPositionParameters()['lng'] });
const contextMenuPosition = ref({ lat: 0, lng: 0 });
const maxBounds = [
  [-90, -180],
  [90, 180],
];

watch(center, (newVal) => {
  if (newVal && newVal.lat && newVal.lng) {
    // Update the URL params and zoom
    setUrlPositionParameters(newVal.lat, newVal.lng, zoom.value);
  }
});

watch(zoom, (newVal) => {
  if (newVal && center.value.lat && center.value.lng) {
    setUrlPositionParameters(center.value.lat, center.value.lng, newVal);
  }
});

const openAddMarkerPopup = (event: { latlng: any; }) => {
  if (addMarkerPopup.value && event.latlng) {
    contextMenuPosition.value = event.latlng;
    addMarkerPopup.value.leafletObject.openPopup(contextMenuPosition.value);
    addMarkerForm.value.focusMultiselect();
  }
};

const handleNewMarkerEvent = (event: Marker) => {
  emit('addedMarker', event);
  addMarkerPopup.value.leafletObject.closePopup();
};

const { canDeleteMarker, deleteMarker, canCreateMarker } = useMarker();

const provider = new OpenStreetMapProvider();

const geosearchControlOptions = {
  provider: provider,
  showMarker: false, // optional: true|false  - default true
  autoClose: true, // optional: true|false  - default false
  updateMap: false, // optional: true|false  - default true
  keepResult: true, // optional: true|false  - default false
};

const searchControl = new (GeoSearchControl as any)(geosearchControlOptions);

const searchResults = ref();

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

//Bounds set slightly higher than actual world max to create a "padding" on the map
watch(ready, (newValue) => {
  leafletObject.value.addControl(searchControl);
  leafletObject.value.on('geosearch/showlocation', goToLocation);
});

const goToLocation = (event: { location: any; }) => {
  const result = event.location;
  center.value = { lat: result.y, lng: result.x };
  // Count how many decimal places there are in the lat/lng, and zoom in accordingly
  const latDecimalPlaces = result.y.toString().split('.')[1].length;
  const lngDecimalPlaces = result.x.toString().split('.')[1].length;
  zoom.value = Math.max(latDecimalPlaces, lngDecimalPlaces) + 3;
};

const setReady = async () => {
  await nextTick();
  ready.value = true;
  leafletObject.value = map.value.leafletObject;
};

</script>
<template>
  <div>
    <l-map :maxBoundsViscosity="1.0"
      :worldCopyJump="true"
      style="width: 100%; height: 100%"
      class="disable-select"
      ref="map"
      v-model:max-bounds="maxBounds"
      :maxZoom="18"
      v-model:zoom="zoom"
      v-model:center="center"
      @contextmenu="openAddMarkerPopup($event)"
      @ready="setReady"
      :options="{ attributionControl: false }"
      :zoomAnimation="true"
      :fadeAnimation="true"
      :markerZoomAnimation="true">

      <l-control-attribution position="bottomright"
        prefix='&copy; <a href="https://cartes.io">Cartes.io</a> &copy; <a href="https://icons8.com/attributions">Icons8</a>'>
      </l-control-attribution>

      <l-control-layers />

      <l-tile-layer name="Street"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
        layer-type="base">
      </l-tile-layer>

      <l-tile-layer name="Topology"
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        :visible="false"
        layer-type="base">
      </l-tile-layer>

      <!-- <l-locatecontrol /> -->

      <l-layer-group ref="addMarkerPopup">
        <l-popup class="unset-select">
          <AddMarkerForm v-if="canCreateMarker()"
            ref="addMarkerForm"
            :mapId="mapId"
            :markers="markers"
            :markerLat="contextMenuPosition.lat"
            :markerLng="contextMenuPosition.lng"
            :allowLatLngElevationOverride="false"
            @addedMarker="handleNewMarkerEvent($event)" />
          <div v-else>You must be logged in to create markers on this map.</div>
        </l-popup>
      </l-layer-group>

      <l-control class="leaflet-control-ar leaflet-bar leaflet-control"
        v-if="showAr && userDevice.supportsAr">
        <a :href="'https://cartesio.netlify.app/?mapId=' + mapId"
          target="_BLANK"
          @click.prevent="emit('showAr')">AR</a>
      </l-control>

      <MapMarkers :mapId="mapId"
        :markers="markers"></MapMarkers>
    </l-map>
  </div>
</template>

<style>
@import 'leaflet-geosearch/dist/geosearch.css';

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

.leaflet-popup-content-wrapper,
.leaflet-popup-tip,
.leaflet-bar a,
.leaflet-control-layers-toggle {
  background-color: var(--card-background-color);
}

.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
  color: inherit;
}

.leaflet-marker-icon {
  background-color: unset;
  border: unset;
}

.leaflet-container a {
  color: inherit;
}
</style>