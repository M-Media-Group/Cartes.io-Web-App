
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

</script>

<template>
  <div class="container-fluid">This is an alpha version of Cartes.io 2 point O. View the original full app <a
      href="https://cartes.io">here</a>
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

            <button @click="share()">Share this map</button>

            <!-- Markers -->
            <details open>
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
              <p>
                Use standard API requests to interact with this map. No
                authentication required for public and unlisted maps.
                <a href="https://github.com/M-Media-Group/Cartes.io/wiki/API"
                  rel="noopener"
                  target="_BLANK">Read the docs</a>.
              </p>
              <ul>
                <li>Use the API to get the map and markers
                  <!-- Code block showing API call -->
                  <pre><code>GET https://cartes.io/api/maps/{{ Maps.map.uuid }}
GET https://cartes.io/api/maps/{{ Maps.map.uuid }}/markers</code></pre>
                </li>
                <li>Embed as iFrame
                  <!-- Code block showing API call -->
                  <pre><code>&lt;iframe src="https://cartes.io/embeds/maps/{{ Maps.map.uuid }}?type=map"
  width="100%"
  height="400"
  frameborder="0"&gt;&lt;/iframe&gt;</code></pre>
                </li>
                <li>Shortcode using our WordPress plugin
                  <!-- Code block showing API call -->
                  <pre><code>[cartes_map uuid="{{ Maps.map.uuid }}"]</code></pre>
                </li>
                <li>Python using our Python package
                  <!-- Code block showing API call -->
                  <pre><code>cartes.Maps('{{ Maps.map.uuid }}').get()</code></pre>
                </li>
                <li>JS using our NPM package
                  <!-- Code block showing API call -->
                  <pre><code>cartes.maps('{{ Maps.map.uuid }}').get()</code></pre>
                </li>
              </ul>
              <p>When using the API or embedding the map, you must attribute this website on your front-end.</p>
            </details>

          </div>
        </section>

        <section v-if="Maps.map.related && Maps.map.related.length > 0">
          <h2>Related maps</h2>
          <ul>
            <li v-for="map in Maps.map.related"
              :key="map.uuid">
              <a :href="'?mapId=' + map.uuid">{{ map.title ?? "No title" }}</a>
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