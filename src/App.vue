<template>
  <h1>{{ Maps.map?.title ?? "Cartes.io" }}</h1>
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
    <p>{{ Maps.map?.description }}</p>
  </template>
  <template v-else>
    <p>No map selected</p>
    <div v-for="map in Maps.maps.value">
      <a :href="'?mapId=' + map.uuid">
        {{ map.title ?? "No title" }}
      </a>
    </div>
  </template>
  <button v-if="Maps.canDeleteMap(Maps.map)"
    @click="Maps.deleteMap(Maps.map)">Delete map</button>
  <button @click="Maps.addMap(null, true)">Create new map</button>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import AugmentedReality from "./views/AugmentedReality.vue";
import NewMapComponent from "@/components/NewMapComponent.vue"
import { useMarker } from "./composables/marker";
import { useMap } from "./composables/map";

const { markers, getAllMarkersForMap } = useMarker();

const Maps = useMap();

const searchParams = new URLSearchParams(window.location.search);

// Get the map ID from the url ?mapId parameter
const mapId = searchParams.get("mapId");

const showMap = ref(searchParams.get("showAr") ?? false);

onMounted(() => {
  if (mapId) {
    Maps.getMap(mapId);
    getAllMarkersForMap(mapId);
  } else {
    Maps.getAllMaps();
  }
});

const toggleMapVisibility = () => {
  showMap.value = !showMap.value;
  searchParams.set("showAr", showMap.value ? "true" : "false");
}
</script>
