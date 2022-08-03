
<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted, ref, defineAsyncComponent, computed, watch, Ref } from "vue";
import { useMarker } from "@/composables/marker";
import { useMap } from "@/composables/map";
import { useRoute } from "vue-router";

const route = useRoute();

const { displayableMarkers, getAllMarkersForMap, listenForMarkerChangesOnMap, showExpired } = useMarker();

const Maps = useMap();

// Get the map ID from the url ?mapId parameter
const mapId = ref(route.params.mapId) as Ref<string>;

const canCreateMarkers = ref();

watch(() => route.params.mapId, () => {
    mapId.value = route.params.mapId as string;
    getAllMarkersForMap(mapId.value);
    Maps.getRelatedMaps(mapId.value);
    listenForMarkerChangesOnMap(mapId.value);
    if (Maps.map.value) {
        canCreateMarkers.value = Maps.canCreateMarkers(Maps.map.value);
    }
}, { immediate: true });


const AR = defineAsyncComponent(() =>
    import("@/views/AugmentedReality.vue")
)

</script>

<template>

    <AR v-if="Maps.map.value"
        :mapId="Maps.map.value.uuid"
        :markers="displayableMarkers"
        @close="$router.push('/maps/' + Maps.map.value?.uuid)" />

</template>
