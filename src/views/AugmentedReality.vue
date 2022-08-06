<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref, computed, PropType, onUnmounted, onBeforeMount, defineAsyncComponent } from "vue";
import AddMarkerForm from "@/components/AddMarkerForm.vue";

import 'aframe'
import 'aframe-look-at-component'

import { Marker } from "@/types/marker";
import { useUrlPositionParameters } from "@/composables/urlPositionParameters";
import userDevice from "@/classes/userDevice";

const props = defineProps({
  markers: {
    type: Array as PropType<Marker[]>,
    required: true,
  },
  showDistance: {
    type: Boolean,
    default: true,
  },
  mapId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'addedMarker'])

const showAddForm = ref(false)

const scale = "40 40 40";

const distanceToGround = ref(0);

const { userPosition, setUrlPositionParameters } = useUrlPositionParameters();

if (userDevice.supportsAr) {
  // Listen for GeolocationCoordinates.altitude changes
  navigator.geolocation.watchPosition((position) => {
    const newValue = Math.round(position.coords.altitude ?? 0);

    distanceToGround.value = newValue;

    userPosition.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      elevation: position.coords.altitude,
    };

    setUrlPositionParameters(
      position.coords.latitude,
      position.coords.longitude,
    );

    markerRefs.value.forEach((markerRef) => {
      if (markerRef) {
        const altitudeToSet = (parseInt(markerRef.getAttribute("data-marker-elevation") ?? "0")) + (newValue * -1);

        // @ts-ignore we ignore the error because we know that the element is a AFRAME element
        markerRef.object3D.position.y = altitudeToSet;
      }
    });
  });
}

const markerRefs = ref<HTMLElement[] | null[]>([]);

const registerMarkerDistanceComponent = () => {
  //@ts-ignore
  if (AFRAME.components["marker-distance"]) {
    return;
  }
  // @ts-ignore
  AFRAME.registerComponent("marker-distance", {
    init: function () {
      this.marker1 = document.querySelector("#camera1")

      // @ts-ignore
      this.marker1Pos = new THREE.Vector3();

      // @ts-ignore
      this.marker2Pos = new THREE.Vector3();

      // this.el.addEventListener("gps-camera-update-positon", () => {
      //   alert("gps-entity-place-update-positon");
      //   const marker = this.el;
      //   if (marker) {
      //     const distance = this.el.getAttribute("distance");
      //     this.el.setAttribute("text", "value", distance.toFixed(2) + "m");
      //   }
      // });
    },
    tick: function () {
      this.markerDistance()
    },
    markerDistance: function () {
      // @ts-ignore
      this.marker1.object3D.getWorldPosition(this.marker1Pos);

      const marker2 = this.el
      // @ts-ignore
      marker2.object3D.getWorldPosition(this.marker2Pos);

      //distance
      this.d = Math.round(this.marker1Pos.distanceTo(this.marker2Pos));
      this.el.setAttribute("value", this.d + "m");
    }
  });
}

if (props.showDistance) {
  registerMarkerDistanceComponent()
}

const computedMarkerCategories = computed(() => {
  const allCategories = props.markers.map((marker) => marker.category);
  const uniqueCategories = [...new Set(allCategories)];
  const categories = uniqueCategories.map((category) => {
    // If the icon does not start with https, it's a relative path - so append the base url
    if (category.icon && !category.icon.startsWith("https")) {
      category.icon = "/marker.svg";
    }
    return category;
  });
  // return the unique categories
  return categories;
});

const close = () => {
  // Emit a close event
  emit("close");
}

const handleNewMarkerEvent = (event: Marker) => {
  showAddForm.value = false;
  emit('addedMarker', event);
};

onBeforeMount(() => {
  var scripts = [
    'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-nft.js'
  ];
  scripts.forEach(script => {
    let tag = document.head.querySelector(`[src="${script}"`);
    if (!tag) {
      tag = document.createElement("script");
      tag.setAttribute("src", script);
      tag.setAttribute("type", 'text/javascript');
      document.head.appendChild(tag);
    }
  });
})

onUnmounted(() => {
  // Seems to be some bug/issue in a-frame that keeps this class in html when unloaded
  // Remove the a-fullscreen class from the html element
  document.querySelector("html")?.classList.remove("a-fullscreen");
});

const AppLayout = defineAsyncComponent(() =>
  import("@/templates/AppLayout.vue")
)

</script>
<template>
  <div v-if="userDevice.supportsAr">
    <button class="close"
      @click="close()">Open map</button>
    <a-scene vr-mode-ui="enabled: false"
      arjs="trackingMethod: best; sourceType: webcam; sourceWidth:1280; sourceHeight:960; displayWidth: 1280; displayHeight: 960; videoTexture: true; debugUIEnabled: false;"
      loading-screen="dotsColor: blue; backgroundColor: black"
      @click="showAddForm = false">
      <a-assets>
        <img v-for="category in computedMarkerCategories"
          :key="'cat-' + category.id"
          :id="'cat-' + category.id"
          :src="category.icon"
          crossorigin="anonymous" />
      </a-assets>
      <template v-for="marker in props.markers"
        :key="marker.id">
        <a-entity ref="markerRefs"
          look-at="#camera1"
          :scale="scale"
          :data-marker-elevation="marker.elevation"
          :position="'0 0 0'"
          :gps-projected-entity-place="
            'latitude: ' +
            marker.location.coordinates[1] +
            '; longitude: ' +
            marker.location.coordinates[0]
          ">
          <a-text :value="marker.category.name"
            :position="'0 0.7 0'">
          </a-text>
          <a-text v-if="props.showDistance"
            marker-distance
            :position="'0 -0.7 0'">
          </a-text>
          <!-- <a-entity position="0 1.6 -1" htmlembed :gps-projected-entity-place="
        'latitude: ' +
        marker.location.coordinates[0] +
        '; longitude: ' +
        marker.location.coordinates[1]
      ">
        <p>My HTML</p>
      </a-entity> -->
          <a-image :title="marker.category.name"
            :src="'#cat-' + marker.category.id"></a-image>
        </a-entity>
      </template>

      <a-camera id="camera1"
        look-controls-enabled="false"
        arjs-look-controls="smoothingFactor: 0.1"
        gps-projected-camera="gpsMinDistance: 2"
        rotation-reader>
      </a-camera>
    </a-scene>
    <AddMarkerForm @click="showAddForm = true"
      :class="{ 'partiallyHidden': !showAddForm }"
      class="addMarkerForm"
      ref="addMarkerForm"
      :mapId="mapId"
      :markers="markers"
      :markerLat="userPosition.lat"
      :markerLng="userPosition.lng"
      :markerElevation="userPosition.elevation"
      @addedMarker="handleNewMarkerEvent($event)" />
  </div>
  <AppLayout v-else>
    <div>
      <p>Your browser/device does not support Augmented Reality.</p>
      <button @click="close()">Open map instead</button>
    </div>
  </AppLayout>
</template>
<style>
a-scene {
  /* aspect ratio */
  width: 100%;
  aspect-ratio: 0.8;
}

/* Hide videos with display=none */
[display="none"] {
  display: none;
}

.close {
  position: fixed;
  right: 16px;
  top: 16px;
  width: auto;
  z-index: 1;
}

.addMarkerForm {
  position: fixed;
  right: 16px;
  left: 16px;
  bottom: 16px;
  z-index: 1;
  background-color: var(--background-color);
  padding: 8px;
  border-radius: 8px;
}

.partiallyHidden {
  transform: translateY(70%);
}
</style>
