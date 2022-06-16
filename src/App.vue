<template>
  <AugmentedReality :markers="markers" @close="redirectToCartes()" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import AugmentedReality from "./views/AugmentedReality.vue";
import { Marker } from "@/types/marker";

const markers = ref([] as Marker[]);

// Get the map ID from the url ?mapId parameter
const mapId = new URLSearchParams(window.location.search).get("mapId");

// Fetch the markers from the api https://cartes.io/api/maps/3bdc0bdc-8a77-40e3-8c34-c70466443980/markers
fetch("https://cartes.io/api/maps/" + mapId + "/markers")
  .then((response) => response.json())
  .then((data) => {
    markers.value = data;
  })
  .catch((error) => {
    console.error("Error:", error);
  });

const redirectToCartes = () => {
  window.location.href = "https://cartes.io/maps/" + mapId;;
}
</script>
