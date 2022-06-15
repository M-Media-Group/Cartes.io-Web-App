<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" /> -->
  <a-scene
    vr-mode-ui="enabled: false"
    arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false;"
    loading-screen="dotsColor: blue; backgroundColor: black"
  >
    <a-assets>
      <img
        v-for="category in computedMarkerCategories"
        :key="'cat-' + category.id"
        :id="'cat-' + category.id"
        :src="category.icon"
        crossorigin="anonymous"
      />
    </a-assets>
    <template v-for="marker in markers" ref="markerRefs" :key="marker.id">
      <a-text
        :value="marker.category.name"
        look-at="#camera1"
        scale="70 70 70"
        position="0 50 0"
        :gps-projected-entity-place="
          'latitude: ' +
          marker.location.coordinates[0] +
          '; longitude: ' +
          marker.location.coordinates[1]
        "
      >
      </a-text>
      <a-image
        look-at="#camera1"
        :title="marker.category.name"
        :src="'#cat-' + marker.category.id"
        scale="70 70 70"
        :gps-projected-entity-place="
          'latitude: ' +
          marker.location.coordinates[0] +
          '; longitude: ' +
          marker.location.coordinates[1]
        "
      ></a-image>
    </template>

    <a-camera
      id="camera1"
      look-controls-enabled="false"
      arjs-look-controls="smoothingFactor: 0.1"
      gps-projected-camera="gpsMinDistance: 5"
      rotation-reader
    >
    </a-camera>
  </a-scene>
</template>
<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref, nextTick, watch, computed } from "vue";
// import HelloWorld from "./components/HelloWorld.vue";
import { Marker } from "./types/marker";

const markerRefs = ref([]);

const markers = ref([] as Marker[]);

// Get the map ID from the url ?mapId parameter
const mapId = new URLSearchParams(window.location.search).get("mapId");

// Fetch the markers from the api https://cartes.io/api/maps/3bdc0bdc-8a77-40e3-8c34-c70466443980/markers
fetch("https://cartes.io/api/maps/" + mapId + "/markers")
  .then((response) => response.json())
  .then((data) => {
    markers.value = data;
  });

const markerWatcher = watch(
  markerRefs,
  (newValue) => {
    console.log("newValue", newValue);
    // On nextTick, in each a-text, update the value
    nextTick(() => {
      const texts = document.querySelectorAll("[gps-entity-place]");
      texts.forEach((text) => {
        // Get the distance attribute
        console.log(text);

        const distance = text.getAttribute("distanceMsg");
        if (distance) {
          text.setAttribute(
            "value",
            text.getAttribute("value") + " " + distance
          );
        }
      });
    });
  },
  { deep: true }
);

const computedMarkerCategories = computed(() => {
  const allCategories = markers.value.map((marker) => marker.category);
  const uniqueCategories = [...new Set(allCategories)];
  const categories = uniqueCategories.map((category) => {
    // If the icon does not start with http, it's a relative path - so append the base url
    if (!category.icon.startsWith("http")) {
      category.icon = "https://cartes.io" + category.icon;
    }
    return category;
  });
  // return the unique categories
  return categories;
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
a-scene {
  /* aspect ratio */
  width: 100%;
  aspect-ratio: 0.8;
}
/* Hide videos with display=none */
[display="none"] {
  display: none;
}
</style>
