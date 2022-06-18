<template>
  <div>
    <l-map :maxBoundsViscosity="1.0"
      :worldCopyJump="true"
      style="width: 100%; height: 100%"
      class="disable-select"
      ref="map"
      v-model:zoom="zoom"
      v-model:center="center"
      @contextmenu="openAddMarkerPopup($event)">
      <l-tile-layer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://cartes.io">Cartes.io</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://icons8.com/attributions">Icons8</a>'>
      </l-tile-layer>

      <!-- <l-control-layers /> -->

      <!-- <l-locatecontrol /> -->

      <l-layer-group ref="addMarkerPopup">
        <l-popup class="unset-select">
          <AddMarkerForm ref="addMarkerForm"
            :mapId="mapId"
            :markers="markers"
            :markerLat="contextMenuPosition.lat"
            :markerLng="contextMenuPosition.lng"
            :allowLatLngElevationOverride="true"
            @addedMarker="handleNewMarkerEvent($event)" />
        </l-popup>
      </l-layer-group>

      <l-control class="leaflet-control-ar leaflet-bar leaflet-control"
        v-if="showAr">
        <a :href="'https://cartesio.netlify.app/?mapId=' + mapId"
          target="_BLANK"
          @click.prevent="emit('showAr')">AR</a>
      </l-control>

      <l-marker v-for="marker in props.markers"
        :lat-lng="marker.location.coordinates"
        :key="marker.id + 'marker'">
        <l-icon :icon-url="marker.category.icon"
          :icon-size="[30, 30]"
          :icon-anchor="[15, 25]" />
        <l-popup class="unset-select">
          <p class="w-100"
            style="min-width: 200px">
            <b>{{ marker.category.name }}</b>
          </p>
          <p class="w-100"
            v-if="marker.description"
            v-html="marker.description"></p>
          <small class="w-100"
            v-if="marker.link"><a :href="marker.link"
              target="blank">{{
                  marker.link.split("/")[2]
              }}</a>
          </small>
          <small class="w-100">Last update:
            <span class="timestamp"
              :datetime="marker.updated_at">{{
                  marker.updated_at
              }}</span>.
          </small>
          <small class="w-100"
            v-if="marker.elevation">Elevation:
            {{ marker.elevation }} meters
          </small>
          <!-- <small v-if="isMarkerExpired(marker.expires_at)" class="w-100">Expired:
            <span class="timestamp" :datetime="marker.expires_at">{{
                marker.expires_at
            }}</span>.</small> -->
          <!-- <details class="small">
            <summary>Click to see address</summary>
            <p class= ">{{ marker.label }}</p>
          </details> -->
          <a class="btn btn-link btn-sm text-danger"
            v-if="canDeleteMarker(marker)"
            @click="deleteMarker(mapId, marker)">Delete</a>
          <!--
          <a class="btn btn-link btn-sm text-warning" v-if="canMarkAsSpamPost(marker)" @click="markAsSpam(marker.id)"
            :disabled="submit_data.loading">Report as spam</a> -->
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>
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

import { computed, PropType, ref, watch } from "vue";
import { useMarker } from "@/composables/marker";
import { useUrlPositionParameters } from "@/composables/urlPositionParameters";

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

const map = ref();

const addMarkerPopup = ref();

const addMarkerForm = ref<any>();

const url = new URL(window.location.href);

const canPost = "only_logged_in";

const centerFromUrl = () => {
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");
  if (lat && lng) {
    return {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };
  }
  return null;
};

const zoomFromUrl = () => {
  const zoom = url.searchParams.get("zoom");
  if (zoom) {
    return parseInt(zoom);
  }
  return null;
};

const { setUrlPositionParameters } = useUrlPositionParameters();

const zoom = ref(zoomFromUrl() || 2);
const center = ref(centerFromUrl() || { lat: 0, lng: 0 });
const contextMenuPosition = ref({ lat: 0, lng: 0 });

watch(center, (newVal) => {
  if (newVal) {
    // Update the URL params and zoom
    setUrlPositionParameters(newVal.lat, newVal.lng, zoom.value);
  }
});

watch(zoom, (newVal) => {
  if (newVal) {
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

const { canDeleteMarker, deleteMarker } = useMarker();

const log = (a: any) => {
  console.log(a);
};

</script>
<style>
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