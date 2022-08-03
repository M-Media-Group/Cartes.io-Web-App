
<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted, ref, defineAsyncComponent, computed, watch, Ref } from "vue";
import { useMarker } from "@/composables/marker";
import { useMap } from "@/composables/map";
import { useRoute } from "vue-router";

const route = useRoute();

const { displayableMarkers, getAllMarkersForMap, listenForMarkerChangesOnMap, showExpired } = useMarker();

const Maps = useMap();

const searchParams = new URLSearchParams(window.location.search);

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
<style>
summary {
    position: relative;
}

.blink {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 15px;
    height: 15px;
}

.blink:before {
    content: "";
    position: relative;
    display: block;
    width: 300%;
    height: 300%;
    box-sizing: border-box;
    margin-left: -100%;
    margin-top: -100%;
    border-radius: 45px;
    background-color: red;
    -webkit-animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.blink:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    width: 100%;
    height: 100%;
    background-color: red;
    border-radius: 15px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
    -webkit-animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
    animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
}

@-webkit-keyframes pulse-ring {
    0% {
        transform: scale(0.33);
    }

    80%,
    100% {
        opacity: 0;
    }
}

@keyframes pulse-ring {
    0% {
        transform: scale(0.33);
    }

    80%,
    100% {
        opacity: 0;
    }
}

@-webkit-keyframes pulse-dot {
    0% {
        transform: scale(0.8);
    }

    50% {
        transform: scale(1);
    }

    100% {
        transform: scale(0.8);
    }
}

@keyframes pulse-dot {
    0% {
        transform: scale(0.8);
    }

    50% {
        transform: scale(1);
    }

    100% {
        transform: scale(0.8);
    }
}

.alert {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;

}
</style>