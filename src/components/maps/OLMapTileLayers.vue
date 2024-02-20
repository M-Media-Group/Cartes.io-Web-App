<script setup lang="ts">
import { onMounted, ref } from 'vue';

const cartoLayer = ref();
const openTopoLayer = ref();
const satelliteLayer = ref();

const layerList = ref([] as any);

onMounted(() => {
    layerList.value.push(cartoLayer.value.tileLayer);
    layerList.value.push(openTopoLayer.value.tileLayer);
    layerList.value.push(satelliteLayer.value.tileLayer);
});
</script>
<template>
    <template>
        <ol-tile-layer ref="cartoLayer"
            title="Carto">
            <ol-source-xyz :maxZoom="19"
                crossOrigin="anonymous"
                attributions="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>"
                url="https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}@2x.png"
                :tilePixelRatio="2" />
        </ol-tile-layer>

        <ol-tile-layer ref="openTopoLayer"
            title="Topology"
            :visible="false">
            <ol-source-xyz :maxZoom="17"
                crossOrigin="anonymous"
                url="https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attributions='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>' />
        </ol-tile-layer>

        <ol-tile-layer ref="satelliteLayer"
            title="Satellite"
            :visible="false">
            <ol-source-xyz :maxZoom="18"
                crossOrigin="anonymous"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attributions='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN,
      IGP, UPR-EGP, and the GIS User Community' />
        </ol-tile-layer>

        <ol-layerswitcherimage-control v-if="layerList.length > 0"
            class="leaflet-control-layers-toggle" />
    </template>
</template>