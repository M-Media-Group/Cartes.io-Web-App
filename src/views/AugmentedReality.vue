<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" /> -->
  <a-scene vr-mode-ui="enabled: false"
    arjs="trackingMethod: best; sourceType: webcam; sourceWidth:1280; sourceHeight:960; displayWidth: 1280; displayHeight: 960; videoTexture: true; debugUIEnabled: false;"
    loading-screen="dotsColor: blue; backgroundColor: black">
    <a-assets>
      <img v-for="category in computedMarkerCategories" :key="'cat-' + category.id" :id="'cat-' + category.id"
        :src="category.icon" crossorigin="anonymous" />
    </a-assets>
    <template v-for="marker in props.markers" :key="marker.id">
      <a-text ref="markerRefs" :value="marker.category.name" look-at="#camera1" :scale="scale" position="0 50 0"
        :gps-projected-entity-place="
          'latitude: ' +
          marker.location.coordinates[0] +
          '; longitude: ' +
          marker.location.coordinates[1]
        ">
      </a-text>
      <a-text v-if="props.showDistance" marker-distance look-at="#camera1" :scale="scale" position="0 40 0"
        :gps-projected-entity-place="
          'latitude: ' +
          marker.location.coordinates[0] +
          '; longitude: ' +
          marker.location.coordinates[1]
        ">
      </a-text>
      <!-- <a-entity position="0 1.6 -1" htmlembed :gps-projected-entity-place="
        'latitude: ' +
        marker.location.coordinates[0] +
        '; longitude: ' +
        marker.location.coordinates[1]
      ">
        <p>My HTML</p>
      </a-entity> -->
      <a-image look-at="#camera1" :title="marker.category.name" :src="'#cat-' + marker.category.id" :scale="scale"
        :gps-projected-entity-place="
          'latitude: ' +
          marker.location.coordinates[0] +
          '; longitude: ' +
          marker.location.coordinates[1]
        "></a-image>
    </template>

    <a-camera id="camera1" look-controls-enabled="false" arjs-look-controls="smoothingFactor: 0.1"
      gps-projected-camera="gpsMinDistance: 2" rotation-reader>
    </a-camera>
  </a-scene>
</template>
<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref, nextTick, watch, computed, PropType } from "vue";
// import HelloWorld from "./components/HelloWorld.vue";
import { Marker } from "@/types/marker";

const props = defineProps({
  markers: {
    type: Array as PropType<Marker[]>,
    required: true,
  },
  showDistance: {
    type: Boolean,
    default: true,
  }
})

const scale = "50 50 50";

const markerRefs = ref<HTMLElement[] | null[]>([]);

if (props.showDistance) {
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
    markerDistance: function (event: any) {
      console.log("event", event, this.el.object3D)

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

const observer = new MutationObserver(function (event) {
  console.log('callback that runs when observer is triggered', event);
});

watch(
  markerRefs,
  (newValue) => {
    console.log("newValue", newValue);
    // On nextTick, in each a-text, update the value
    const placeEntities = document.querySelectorAll("[gps-projected-entity-place]")

    placeEntities.forEach((markerRef) => {
      if (!markerRef) {
        return;
      }
      console.log("markerRef", markerRef);
      observer.observe(markerRef, { subtree: true, childList: true });
    });
    // nextTick(() => {
    //   const texts = document.querySelectorAll("[gps-projected-entity-place]");
    //   const camera = document.querySelector('[gps-projected-camera]');

    //   // Sleep 3 seconds
    //   setTimeout(() => {
    //     // Update the value of each a-text

    //     texts.forEach((text) => {
    //       console.log('NewValText', text);
    //       const distance = text.getAttribute("distancemsg");
    //       if (!camera || !distance) {
    //         return;
    //       }
    //       text.addEventListener('markerFound', () => {
    //         let cameraPosition = camera.object3D.position;
    //         let markerPosition = text.object3D.position;
    //         let distance = cameraPosition.distanceTo(markerPosition)

    //         const check = setInterval(() => {
    //           cameraPosition = camera.object3D.position;
    //           markerPosition = text.object3D.position;
    //           distance = cameraPosition.distanceTo(markerPosition)

    //           // do what you want with the distance:
    //           console.log(distance);
    //         }, 100);
    //       });
    //       if (distance) {
    //         text.setAttribute(
    //           "value",
    //           text.getAttribute("value") + " " + distance
    //         );
    //       }
    //     });
    //   });
    // },
    // );
  }
  , { deep: true }
);

const computedMarkerCategories = computed(() => {
  const allCategories = props.markers.map((marker) => marker.category);
  const uniqueCategories = [...new Set(allCategories)];
  const categories = uniqueCategories.map((category) => {
    // If the icon does not start with https, it's a relative path - so append the base url
    if (!category.icon.startsWith("https")) {
      category.icon = "/marker.svg";
    }
    return category;
  });
  // return the unique categories
  return categories;
});

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

a-scene {
  /* aspect ratio */
  width: 100%;
  aspect-ratio: 0.8;
}

/* Hide videos with display=none */
[display="none"] {
  display: none;
}
</style>
