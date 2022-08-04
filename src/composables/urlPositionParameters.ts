import { ref } from "vue";

// We cant use useRouter here it seems because there are some events emitted that can only be done in components, so we use the raw router here
import router from "@/router/index";

const url = new URL(window.location.href);

const distanceToGround = ref(0);

const userPosition = ref({
    lat: 0,
    lng: 0,
    elevation: null as number | null,
});

const currentPosition = ref({
    lat: 0,
    lng: 0,
    zoom: null as number | null,
});

// @todo need to reconsider this whole approach with the current map position - we need a debounce here and when theres a lot of leaflet instnaces they all fight to update teh position, and so it causes some lag and issues
const setUrlPositionParameters = (lat: number, lng: number, zoom = null as number | null) => {
    // If the currentPosition is the same as the new position, do nothing
    if (currentPosition.value.lat === lat && currentPosition.value.lng === lng) {
        return;
    }

    currentPosition.value.lat = lat;
    currentPosition.value.lng = lng;

    if (zoom) {
        currentPosition.value.zoom = zoom;
    }

    myDebounce();

}

const debounce = (callback: () => void, time: number) => {
    let interval: string | number | NodeJS.Timeout | null;
    return (...args: []) => {
        if (interval) {
            clearTimeout(interval);
        }
        interval = setTimeout(() => {
            interval = null;
            callback(...args);
        }, time);
    };
};

const myDebounce = debounce(() => {
    if (!currentPosition.value.lat || !currentPosition.value.lng) {
        return;
    }
    router.replace({ query: currentPosition.value })
    // window.history.replaceState({}, "", url.href);
}, 300);

const getUrlPositionParameters = () => {
    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");
    const zoom = url.searchParams.get("zoom");

    return {
        lat: lat ? parseFloat(lat) : 0,
        lng: lng ? parseFloat(lng) : 0,
        zoom: zoom ? parseFloat(zoom) : null,
    };
}

export function useUrlPositionParameters() {

    return {
        distanceToGround,
        userPosition,
        setUrlPositionParameters,
        getUrlPositionParameters
    };
}