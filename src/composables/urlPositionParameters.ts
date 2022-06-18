import { ref } from "vue";

export function useUrlPositionParameters() {

    const url = new URL(window.location.href);

    const distanceToGround = ref(0);

    const userPosition = ref({
        lat: 0,
        lng: 0,
        elevation: null as number | null,
    });

    const setUrlPositionParameters = (lat: number, lng: number, zoom = null as number | null) => {
        url.searchParams.set("lat", lat.toString());
        url.searchParams.set("lng", lng.toString());
        if (zoom) {
            url.searchParams.set("zoom", zoom.toString());
        }
        window.history.replaceState({}, "", url.href);
    }

    const getUrlPositionParameters = () => {
        const lat = url.searchParams.get("lat");
        const lng = url.searchParams.get("lng");
        const zoom = url.searchParams.get("zoom");
        return {
            lat: lat ? parseFloat(lat) : null,
            lng: lng ? parseFloat(lng) : null,
            zoom: zoom ? parseFloat(zoom) : null,
        };
    }

    return {
        distanceToGround,
        userPosition,
        setUrlPositionParameters,
        getUrlPositionParameters
    };
}