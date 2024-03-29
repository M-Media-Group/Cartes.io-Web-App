import { computed, ref, watch } from "vue";
import { useMarker } from "@/composables/marker";
import { useUrlPositionParameters } from "./urlPositionParameters";
import userDevice from "@/classes/userDevice";

const { setUrlPositionParameters, getUrlPositionParameters } = useUrlPositionParameters();

const { markers } = useMarker();

// @todo need to reconsider this whole approach with the current map position - we need a debounce here and when theres a lot of leaflet instnaces they all fight to update the position, and so it causes some lag and issues

const zoom = ref(getUrlPositionParameters()['zoom'] || 2);
const center = ref({ lat: getUrlPositionParameters()['lat'], lng: getUrlPositionParameters()['lng'] });
const contextMenuPosition = ref({ lat: 0, lng: 0 });

const maxBounds = [
    [-90, -180],
    [90, 180],
];

const averageCenter = computed(() => {

    if (!markers.value || markers.value.length === 0) {
        return { ...center.value, zoom: zoom.value };
    }

    const markerCoordinates = markers.value
        .map((m) => {
            return [m.location.coordinates[1] - 0.1, m.location.coordinates[0] - 0.1];
        })

    // Compute the average center
    const coordinates = markerCoordinates.reduce((acc, curr) => {
        return [acc[0] + curr[0], acc[1] + curr[1]];
    }, [0, 0]);

    const newCoordinates = {
        lat: coordinates[0] / markerCoordinates.length,
        lng: coordinates[1] / markerCoordinates.length,
        zoom: 3,
    }

    return newCoordinates;

    // Compute the min and max bounds
    // const minMaxBounds = markerCoordinates.reduce((acc, curr) => {
    //     return [
    //         [Math.min(acc[0][0], curr[0]), Math.min(acc[0][1], curr[1])],
    //         [Math.max(acc[1][0], curr[0]), Math.max(acc[1][1], curr[1])],
    //     ];
    // }, [[-180, -90], [180, 90]]);

});

watch(center, (newVal, oldVal) => {
    if (newVal.lat === oldVal.lat && newVal.lng === oldVal.lng) {
        return;
    }
    if (newVal && newVal.lat && newVal.lng) {
        // Update the URL params and zoom
        setUrlPositionParameters(newVal.lat, newVal.lng, zoom.value);
    }
});

watch(zoom, (newVal, oldVal) => {
    if (newVal === oldVal) {
        return;
    }
    if (newVal && center.value.lat && center.value.lng) {
        setUrlPositionParameters(center.value.lat, center.value.lng, newVal);
    }
});

const goToDeviceLocation = async () => {
    const result = await userDevice.location;
    if (result) {
        center.value = { lat: result.latitude, lng: result.longitude };
        zoom.value = 15;
    }
}

const setMapPosition = (lat: number, lng: number, zoomPassed: number) => {
    center.value = { lat, lng };
    zoom.value = zoomPassed;
}

export function useMapPosition() {

    // Provide a flyTo method
    // const flyToMarker = (marker: Marker) => {
    //     if (!leafletObject || !leafletObject.value) {
    //     leafletObject.value.flyTo({
    //         center: [marker.location.coordinates[1], marker.location.coordinates[0]],
    //         zoom: zoom.value,
    //     });
    // };

    // Make it accecible from the outside using provide/inject
    // provide("flyToMarker", flyToMarker);

    return {
        goToDeviceLocation,
        center,
        zoom,
        contextMenuPosition,
        maxBounds,
        averageCenter,
        setMapPosition
    }

}