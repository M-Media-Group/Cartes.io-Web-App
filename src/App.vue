<template>
  <h1>Cartes.io</h1>
  <template v-if="mapId">
    <AugmentedReality :mapId="mapId"
      :markers="markers"
      @close="toggleMapVisibility()"
      v-if="!showMap" />
    <NewMapComponent v-if="showMap"
      :mapId="mapId"
      :show-ar="true"
      :markers="markers"
      style="height: 70vh"
      @showAr="toggleMapVisibility()">
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

const toggleMapVisibility = () => {
  showMap.value = !showMap.value;
  searchParams.set("showAr", showMap.value ? "true" : "false");
}
</script>
