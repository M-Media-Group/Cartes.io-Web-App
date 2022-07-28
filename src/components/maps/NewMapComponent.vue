
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
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

import AddMarkerForm from "@/components/AddMarkerForm.vue";

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

import { computed, PropType, ref, watch } from "vue";
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
    type: String as PropType<string | number>,
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
  map.value.leafletObject.addControl(searchControl);
  map.value.leafletObject.on('geosearch/showlocation', goToLocation);
});

const goToLocation = (event: { location: any; }) => {
  const result = event.location;
  center.value = { lat: result.y, lng: result.x };
  // Count how many decimal places there are in the lat/lng, and zoom in accordingly
  const latDecimalPlaces = result.y.toString().split('.')[1].length;
  const lngDecimalPlaces = result.x.toString().split('.')[1].length;
  zoom.value = Math.max(latDecimalPlaces, lngDecimalPlaces) + 3;
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
      v-model:zoom="zoom"
      v-model:center="center"
      @contextmenu="openAddMarkerPopup($event)"
      @ready="ready = true">
      <l-tile-layer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://cartes.io">Cartes.io</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://icons8.com/attributions">Icons8</a>'>
      </l-tile-layer>

      <!-- <l-control-layers /> -->

      <!-- <l-locatecontrol /> -->

      <l-layer-group ref="addMarkerPopup">
        <l-popup class="unset-select">
          <AddMarkerForm v-if="canCreateMarker()"
            ref="addMarkerForm"
            :mapId="mapId"
            :markers="markers"
            :markerLat="contextMenuPosition.lat"
            :markerLng="contextMenuPosition.lng"
            :allowLatLngElevationOverride="true"
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
</style>