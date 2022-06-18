import { Marker, MarkerForm } from "@/types/marker";
import { computed } from "@vue/reactivity";
import { PropType, defineEmits, getCurrentInstance, ref, reactive } from "vue";

export function useUrlPositionParameters() {

    const url = new URL(window.location.href);

    const distanceToGround = ref(0);

    const userPosition = ref({
        lat: 0,
        lng: 0,
    });

    const setUrlPositionParameters = (lat: number, lng: number, zoom = null as number | null) => {
        url.searchParams.set("lat", lat.toString());
        url.searchParams.set("lng", lng.toString());
        if (zoom) {
            url.searchParams.set("zoom", zoom.toString());
        }
        window.history.pushState({}, "", url.href);
    }

    return {
        distanceToGround,
        userPosition,
        setUrlPositionParameters
    };
}