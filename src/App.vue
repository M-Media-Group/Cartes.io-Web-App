
<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted, ref, defineAsyncComponent } from "vue";
import NewMapComponent from "@/components/maps/NewMapComponent.vue"
import { useMarker } from "@/composables/marker";
import { useMap } from "@/composables/map";
import userDevice from "@/classes/userDevice";
import MapCards from "@/components/maps/MapCards.vue";
import EditMapForm from "@/components/maps/EditMapForm.vue";
import DeveloperInfo from "@/components/DeveloperInfo.vue";
import AppLayout from "./templates/AppLayout.vue";

const { markers, getAllMarkersForMap, listenForMarkerChangesOnMap } = useMarker();

const Maps = useMap();

const searchParams = new URLSearchParams(window.location.search);

// Get the map ID from the url ?mapId parameter
const mapId = searchParams.get("mapId");

const showMap = ref((userDevice.supportsAr && searchParams.get("showAr")) ?? true);

const canCreateMarkers = ref();

onMounted(() => {
  if (mapId) {
    getAllMarkersForMap(mapId);
    Maps.getRelatedMaps(mapId);
    listenForMarkerChangesOnMap(mapId);
    Maps.getMap(mapId).then(() => {
      canCreateMarkers.value = Maps.canCreateMarkers(Maps.map);
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
  import("./views/AugmentedReality.vue")
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

const isLive = ref(false);

window.Echo.connector.pusher.connection.bind("connected", () => {
  isLive.value = true;
});

window.Echo.connector.pusher.connection.bind("disconnected", () => {
  isLive.value = false;
});


</script>

<template>
  <AppLayout>

    <template #header
      v-if="Maps.map">

      <AR :mapId="Maps.map.uuid"
        :markers="markers"
        @close="toggleMapVisibility()"
        v-if="!showMap" />

      <NewMapComponent v-else
        :mapId="Maps.map.uuid"
        :show-ar="true"
        :markers="markers"
        style="height: 70vh"
        @showAr="toggleMapVisibility()" />
    </template>

    <template v-if="Maps.map && showMap">
      <div style="margin-top:var(--nav-element-spacing-vertical);">
        <section class="grid">
          <div>
            <h1>{{ Maps.map.title ?? "Untitled map" }}</h1>
            <p>{{ Maps.map?.description }}</p>
          </div>
          <div>

            <button @click="share()">Share this map</button>

            <!-- Markers -->
            <details open
              v-if="markers.length > 0">
              <summary aria-haspopup="listbox"
                role="button"
                class="secondary">
                <div v-if="isLive"
                  class="blink"></div> {{ isLive ? 'Live feed' : 'Feed' }}
              </summary>
              <MapCards role="listbox"
                :markers="markers" />
            </details>
            <!-- Settings -->
            <details v-if="Maps.canUpdateMap(Maps.map)">
              <summary aria-haspopup="listbox"
                role="button"
                class="secondary">
                Map settings
              </summary>
              <EditMapForm role="listbox"
                :map="Maps.map" />
            </details>

            <p v-if="canCreateMarkers">Right click (or long-tap on mobile) on the map to create a
              marker. You can
              choose
              one of the existing
              labels or create your own.</p>

            <!-- Developer -->
            <details>
              <summary>Developer info</summary>
              <DeveloperInfo :map="Maps.map" />
            </details>

          </div>
        </section>

        <section v-if="Maps.map.related && Maps.map.related.length > 0">
          <h2>Related maps</h2>
          <ul>
            <li v-for="map in Maps.map.related"
              :key="map.uuid">
              <a :href="'?mapId=' + map.uuid">{{ map.title ?? "Untitled map" }}</a>
            </li>
          </ul>
        </section>
      </div>
    </template>

    <template v-else>
      <h1>Cartes.io</h1>
      <div v-for="map in Maps.maps.value"
        :key="map.uuid">
        <a :href="'?mapId=' + map.uuid">
          {{ map.title ?? "Untitled map" }}
        </a>
      </div>
    </template>
  </AppLayout>
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

/* .blink {
  -webkit-font-smoothing: antialiased;
  animation-delay: 0s;
  animation-direction: normal;
  animation-duration: 1.5s;
  animation-fill-mode: none;
  animation-iteration-count: infinite;
  animation-name: blinker;
  animation-play-state: running;
  animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
  box-sizing: border-box;
  color: rgb(227, 52, 47);
  cursor: pointer;
  display: inline-block;
  font-family: FontAwesome;
  font-size: 20px;
  font-stretch: normal;
  font-style: normal;
  font-variant-caps: normal;
  font-weight: 400;
  height: 20px;
  line-height: 20px;
  list-style-image: none;
  list-style-position: outside;
  list-style-type: none;
  text-align: left;
  text-rendering: auto;
  width: 17.15625px;
  word-wrap: break-word;
}

.blink::before {
  box-sizing: border-box;
  content: "";
  display: inline;
  height: auto;
  width: auto;
} */
</style>