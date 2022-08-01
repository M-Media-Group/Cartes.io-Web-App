
<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from "vue";
import AugmentedReality from "./views/AugmentedReality.vue";
import NewMapComponent from "@/components/maps/NewMapComponent.vue"
import { useMarker } from "./composables/marker";
import { useMap } from "./composables/map";
import userDevice from "@/classes/userDevice";
import MapCards from "./components/maps/MapCards.vue";
import EditMapForm from "./components/maps/EditMapForm.vue";

const { markers, getAllMarkersForMap } = useMarker();

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
  } else {
    Maps.getAllMaps();
  }
});

const toggleMapVisibility = () => {
  showMap.value = !showMap.value;
  searchParams.set("showAr", showMap.value ? "true" : "false");
}
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

    <AugmentedReality :mapId="mapId"
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
                Markers
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

        <section>
          <h2>Related maps</h2>
          <ul>
            <li v-for="map in Maps.map.related"
              :key="map.uuid">
              <div :to="` /maps?mapId=${map.uuid}`">{{ map.title }}</div>
            </li>
          </ul>
        </section>
      </div>
    </template>

  </template>

  <template v-else>
    <h1>Cartes.io</h1>
    <p>No map selected</p>
    <div v-for="map in Maps.maps.value"
      :key="map.uuid">
      <a :href="'?mapId=' + map.uuid">
        {{ map.title ?? "No title" }}
      </a>
    </div>
  </template>

</template>