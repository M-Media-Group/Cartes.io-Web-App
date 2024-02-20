
<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from "vue";
import { useMarker } from "@/composables/marker";
import { useMap } from "@/composables/map";
import { useRoute } from "vue-router";
import MapLoader from "@/components/maps/MapLoader.vue";
import OLMapVue from "@/components/maps/OLMapVue.vue";

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

const showLoader = ref(true);

const NewMapComponent = defineAsyncComponent(() =>
    import('@/components/maps/NewMapComponent.vue')
)

</script>

<template>
    <MapLoader v-if="showLoader && mapId"
        style="height: 100vh"></MapLoader>
    <div v-if="mapId"
        v-show="!showLoader">
        <OLMapVue :mapId="mapId"
            :show-ar="false"
            :markers="displayableMarkers"
            style="height: 100vh"
            @ready="showLoader = false" />
    </div>
    <div v-else>
        Map not found
    </div>
</template>
