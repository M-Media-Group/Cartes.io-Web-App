
<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted, ref, defineAsyncComponent, computed } from "vue";
import NewMapComponent from "@/components/maps/NewMapComponent.vue"
import { useMarker } from "@/composables/marker";
import { useMap } from "@/composables/map";
import userDevice from "@/classes/userDevice";

import { now } from "@/composables/time";
import { useRoute } from "vue-router";
import { usePusher } from "@/composables/pusher.js";

const route = useRoute();

const { displayableMarkers, getAllMarkersForMap, listenForMarkerChangesOnMap, showExpired } = useMarker();

const Maps = useMap();

const searchParams = new URLSearchParams(window.location.search);

// Get the map ID from the url ?mapId parameter
const mapId = route.params.mapId as string;

const showMap = ref((userDevice.supportsAr && searchParams.get("showAr")) ?? true);

const canCreateMarkers = ref();

onMounted(() => {
    if (mapId) {
        getAllMarkersForMap(mapId);
        Maps.getRelatedMaps(mapId);
        listenForMarkerChangesOnMap(mapId);
        Maps.getMap(mapId).then(() => {
            if (!Maps.map.value) {
                return;
            }
            canCreateMarkers.value = Maps.canCreateMarkers(Maps.map.value);
        });
    } else {
        Maps.getAllMaps();
    }
});

const toggleMapVisibility = () => {
    showMap.value = !showMap.value;
    searchParams.set("showAr", showMap.value ? "true" : "false");
}

const AR = defineAsyncComponent(() =>
    import("@/views/AugmentedReality.vue")
)

const share = async () => {
    // Current url
    const url = window.location.href;
    // Trigger the Share Web API, or copy to clipboard if not supported
    const sharer = navigator.share;
    if (navigator.share) {
        await navigator.share({
            title: "Cartes.io map",
            text: `Check out this map I made! ${url}`,
            url: url,
        });
    } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(url);
        alert("Map link copied to clipboard!");
    }
}

const { isLive } = usePusher();

const mapAgeInMinutes = computed(() => {
    if (Maps.map) {
        if (!Maps.map.value) {
            return 0;
        }
        const createdAt = new Date(Maps.map.value.created_at);
        const diff = now.value - createdAt.getTime();
        return Math.round(diff / 60000);
    }
    return 0;
});

const mapCreatedTimeAgo = computed(() => {
    if (Maps.map) {
        return new Intl.RelativeTimeFormat("en-US").format(-mapAgeInMinutes.value, 'minute');
    }
})
</script>

<template>

    <div v-if="mapId">
        <NewMapComponent :mapId="mapId"
            :show-ar="false"
            :markers="displayableMarkers"
            style="height: 100vh"
            @showAr="toggleMapVisibility()" />
    </div>
    <div v-else>
        Map not found
    </div>

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