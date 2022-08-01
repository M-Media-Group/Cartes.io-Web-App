
<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted, ref, defineAsyncComponent } from "vue";
import NewMapComponent from "@/components/maps/NewMapComponent.vue"
import { useMarker } from "./composables/marker";
import { useMap } from "./composables/map";
import userDevice from "@/classes/userDevice";
import MapCards from "./components/maps/MapCards.vue";
import EditMapForm from "./components/maps/EditMapForm.vue";

const { markers, getAllMarkersForMap, listenForMarkerChangesOnMap } = useMarker();

const Maps = useMap();

const searchParams = new URLSearchParams(window.location.search);

// Get the map ID from the url ?mapId parameter
const mapId = searchParams.get("mapId");

const showMap = ref((userDevice.supportsAr && searchParams.get("showAr")) ?? true);

const related = ref();

onMounted(() => {
  if (mapId) {
    Maps.getMap(mapId);
    getAllMarkersForMap(mapId);
    Maps.getRelatedMaps(mapId);
    listenForMarkerChangesOnMap(mapId);
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

</script>

<template>
  <div class="container-fluid">This is an alpha version of Cartes.io 2 point O. View the original full app <a
      href="https://cartes.io/login">here</a>
  </div>

  <nav class="container-fluid">
    <ul>
      <li><a href="/"><strong>Cartes.io</strong></a></li>
    </ul>
    <ul>
      <li><a href="https://cartes.io/login">Login</a></li>
      <li>
        <button @click="Maps.addMap(null, true)">Create new map</button>
      </li>
    </ul>
  </nav>

  <template v-if="mapId && Maps.map">

    <AR :mapId="mapId"
      :markers="markers"
      @close="toggleMapVisibility()"
      v-if="!showMap" />

    <template v-else>
      <NewMapComponent :mapId="mapId"
        :show-ar="true"
        :markers="markers"
        style="height: 70vh"
        @showAr="toggleMapVisibility()">
      </NewMapComponent>
      <div class="container"
        style="margin-top:var(--nav-element-spacing-vertical);">
        <section class=" grid">
          <div>
            <h1>{{ Maps.map.title }}</h1>
            <p>{{ Maps.map?.description }}</p>
          </div>
          <div>

            <button>Share this map</button>

            <!-- Markers -->
            <details>
              <summary aria-haspopup="listbox"
                role="button"
                class="secondary">
                <i class="fa fa-circle text-danger blink"></i> Live feed
              </summary>
              <MapCards role="listbox"
                :markers="markers" />
            </details>
            <!-- Settings -->
            <details v-if="Maps.canUpdateMap(Maps.map)">
              <summary aria-haspopup="listbox"
                role="button"
                class="secondary">
                Settings
              </summary>
              <EditMapForm role="listbox"
                :map="Maps.map" />
            </details>

          </div>
        </section>

        <section v-if="Maps.map.related && Maps.map.related.length > 0">
          <h2>Related maps</h2>
          <ul>
            <li v-for="map in Maps.map.related"
              :key="map.uuid">
              <a :href="'?mapId=' + map.uuid">{{ map.title }}</a>
            </li>
          </ul>
        </section>
      </div>
    </template>

  </template>

  <div class="container"
    v-else>
    <h1>Cartes.io</h1>
    <div v-for="map in Maps.maps.value"
      :key="map.uuid">
      <a :href="'?mapId=' + map.uuid">
        {{ map.title ?? "No title" }}
      </a>
    </div>
  </div>

</template>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.blink {
  height: 8px;
  width: 8px;
  aspect-ratio: 1;
  animation: blink 1s infinite;
  background: red;
  border-radius: 50%;
}

.blink::before {
  /* content: "x"; */
  height: 8px;
  width: 8px;
  aspect-ratio: 1;
  opacity: 0;
}

/* Blink animation */
@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
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