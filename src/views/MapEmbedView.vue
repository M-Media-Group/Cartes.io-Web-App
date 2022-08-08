
<script setup lang="ts">
import { onMounted, ref } from "vue";
import NewMapComponent from "@/components/maps/NewMapComponent.vue"
import { useMarker } from "@/composables/marker";
import { useMap } from "@/composables/map";
import { useRoute } from "vue-router";

const route = useRoute();

const { displayableMarkers, getAllMarkersForMap, listenForMarkerChangesOnMap } = useMarker();

const Maps = useMap();

// Get the map ID from the url ?mapId parameter
const mapId = route.params.mapId as string;

const canCreateMarkers = ref();

onMounted(() => {
    if (mapId) {
        getAllMarkersForMap(mapId);
        Maps.getRelatedMaps(mapId);
        listenForMarkerChangesOnMap(mapId);
        if (Maps.map.value) {
            canCreateMarkers.value = Maps.canCreateMarkers(Maps.map.value);
        }
    }
});


</script>

<template>

    <div v-if="mapId">
        <NewMapComponent :mapId="mapId"
            :show-ar="false"
            :markers="displayableMarkers"
            style="height: 100vh" />
    </div>
    <div v-else>
        Map not found
    </div>

</template>
