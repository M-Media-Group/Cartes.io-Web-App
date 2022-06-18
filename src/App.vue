<template>
  <h1>Cartes.io</h1>
  <template v-if="mapId">
    <AugmentedReality :mapId="mapId" :markers="markers" @close="showMap = true" v-if="!showMap"
      @addedMarker="addMarkerToMarkerArray($event)" @deletedMarker="removeMarkerFromMarkerArray($event)" />
    <NewMapComponent v-if="showMap" :mapId="mapId" :show-ar="true" :markers="markers" style="height: 50vh"
      @addedMarker="addMarkerToMarkerArray($event)" @deletedMarker="removeMarkerFromMarkerArray($event)"
      @showAr="showMap = !showMap">
    </NewMapComponent>
  </template>
  <template v-else>
    <p>No map selected</p>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import AugmentedReality from "./views/AugmentedReality.vue";
import NewMapComponent from "@/components/NewMapComponent.vue"
import { Marker } from "@/types/marker";
import { useMarker } from "./composables/marker";

const { markers, getAllMarkersForMap } = useMarker();

const searchParams = new URLSearchParams(window.location.search);

// Get the map ID from the url ?mapId parameter
const mapId = searchParams.get("mapId");

const showMap = ref(searchParams.get("showAr") ?? false);

onMounted(() => {
  if (mapId) {
    getAllMarkersForMap(mapId);
  }
});

const redirectToCartes = () => {
  window.location.href = "https://cartes.io/maps/" + mapId;;
}

const addMarkerToMarkerArray = (marker: Marker) => {
  markers.value.push(marker);
}

const removeMarkerFromMarkerArray = (marker: Marker) => {
  markers.value = markers.value.filter((m) => m.id !== marker.id);
}
</script>
