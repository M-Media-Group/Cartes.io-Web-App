import { Marker } from "@/types/marker";
import { provide, ref, watch } from "vue";
import { useUrlPositionParameters } from "./urlPositionParameters";

const { setUrlPositionParameters, getUrlPositionParameters } = useUrlPositionParameters();

const zoom = ref(getUrlPositionParameters()['zoom'] || 2);
const center = ref({ lat: getUrlPositionParameters()['lat'], lng: getUrlPositionParameters()['lng'] });
const contextMenuPosition = ref({ lat: 0, lng: 0 });
const maxBounds = [
    [-90, -180],
    [90, 180],
];

watch(center, (newVal) => {
    if (newVal && newVal.lat && newVal.lng) {
        // Update the URL params and zoom
        setUrlPositionParameters(newVal.lat, newVal.lng, zoom.value);
    }
});

watch(zoom, (newVal) => {
    if (newVal && center.value.lat && center.value.lng) {
        setUrlPositionParameters(center.value.lat, center.value.lng, newVal);
    }
});

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
        center,
        zoom,
        contextMenuPosition,
        maxBounds,
    }

}