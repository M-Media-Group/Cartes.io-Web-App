import userDevice from "@/classes/userDevice";
import { Map } from "@/types/map";
import { Marker, MarkerForm } from "@/types/marker";
import { computed } from "@vue/reactivity";
import { PropType, defineEmits, getCurrentInstance, ref, reactive } from "vue";
import { useMap } from "./map";
import cartes from "@m-media/npm-cartes-io";

const markers = ref<Marker[]>([]);

export function useMarker() {

    const Map = useMap();

    const minCategoryNameLength = 3;

    const emit = getCurrentInstance()?.emit as any;

    const isLoading = ref(false);

    const formErrors = reactive<MarkerForm>({
        lat: "",
        lng: "",
        elevation: null,
        category_name: "",
        description: "",
        link: "",
    });

    const addMarkerToMarkerArray = (marker: Marker) => {
        if (!markerExistsInArray(marker)) {
            markers.value.push(marker);
        } else {
            updateMarkerInMarkerArray(marker);
        }
    }

    const updateMarkerInMarkerArray = (marker: Marker) => {
        const index = markers.value.findIndex((m) => m.id === marker.id);
        if (index !== -1) {
            markers.value[index] = marker;
        }
    }

    const markerExistsInArray = (marker: Marker) => {
        return !!markers.value.find(m => m.id === marker.id);
    }

    const removeMarkerFromMarkerArray = (marker: Marker) => {
        markers.value = markers.value.filter((m) => m.id !== marker.id);
    }

    const hasErrors = computed(() => {
        return Object.values(formErrors).some((error) => error !== "");
    });

    const getAllMarkersForMap = async (mapId: string) => {
        if (!userDevice.online) {
            return alert("You need to be online to add a marker");
        }

        const data = await cartes.maps(mapId).markers().addParam('show_expired', 'true').get();

        data.forEach((marker: Marker) => {
            if (marker.category.icon && !marker.category.icon.startsWith("https")) {
                marker.category.icon = "/marker.svg";
            }
        });

        markers.value = data;
    };

    const validateMarkerForm = (form: MarkerForm) => {
        if (form.lat === "") {
            formErrors.lat = "Enter a valid latitude";
        }

        if (form.lng === "") {
            formErrors.lng = "Enter a valid longitude";
        }

        // if (form.elevation === null) {
        //     formErrors.elevation = "Enter a valid elevation";
        // }

        if (form.category_name?.length < minCategoryNameLength) {
            formErrors.category_name = "Enter a valid category name";
        }

        // if (form.description === "") {
        //     formErrors.description = "Enter a valid description";
        // }

        // if (form.link === "") {
        //     formErrors.link = "Enter a valid link";
        // }
        return !hasErrors.value;
    };

    const canCreateMarkerForMap = (map: Map) => {
        return Map.canCreateMarkers(map);
    }

    const canCreateMarker = () => {
        return canCreateMarkerForMap(Map.map);
    }

    const addMarker = async (mapId: string, formData: any) => {
        if (Map.map.uuid == mapId) {
            if (!canCreateMarker()) {
                return alert("You need to be logged in to add a marker");
            }
        }

        if (!validateMarkerForm(formData)) {
            return;
        };

        if (!userDevice.online) {
            return alert("You need to be online to add a marker");
        };

        isLoading.value = true;
        const data = await cartes.maps(mapId, localStorage.getItem("map_" + mapId)).markers().create(formData);
        if (data.id) {
            if (data.category.icon && !data.category.icon.startsWith("https")) {
                data.category.icon = "/marker.svg";
            }
            addMarkerToMarkerArray(data);
            localStorage["post_" + data.id] = data.token;
            emit("addedMarker", data);
        }

        isLoading.value = false;

    };

    const canDeleteMarker = (marker: Marker) => {
        return marker.token || localStorage.getItem("post_" + marker.id);
    };

    const deleteMarker = async (mapId: string, marker: Marker) => {
        if (!userDevice.online) {
            return alert("You need to be online to delete a marker");
        }
        // Check that the marker exists and that it has a token field
        if (canDeleteMarker(marker)) {
            await cartes.maps(mapId).markers(marker.id, (marker.token || localStorage.getItem("post_" + marker.id))).delete();
            removeMarkerFromMarkerArray(marker);
            localStorage.removeItem("post_" + marker.id);
            emit('deletedMarker', marker);
        }
    };


    const listenForNewMarkers = async (mapId: string) => {

        window.Echo.channel("maps." + mapId).listen(
            "MarkerCreated",
            (e: { marker: Marker; }) => {
                if (e.marker.category.icon && !e.marker.category.icon.startsWith("https")) {
                    e.marker.category.icon = "/marker.svg";
                }
                if (markerExistsInArray(e.marker)) {
                    return;
                }
                addMarkerToMarkerArray(e.marker);
                emit("addedMarker", e.marker);
            }
        );

    }

    const listenForDeletedMarkers = async (mapId: string) => {
        window.Echo.channel("maps." + mapId).listen(
            "MarkerDeleted",
            (e: { marker: Marker; }) => {
                removeMarkerFromMarkerArray(e.marker);
            }
        );
    }

    const listenForMarkerChangesOnMap = async (mapId: string) => {
        listenForDeletedMarkers(mapId);
        listenForNewMarkers(mapId);
    }

    const showExpired = ref(false)

    const nonExpiredMarkers = computed(() => {
        return markers.value.filter((m) => !m.expires_at || m.expires_at > new Date());
    })

    const displayableMarkers = computed(() => {
        if (showExpired.value) {
            return markers.value;
        }
        return nonExpiredMarkers.value;
    })

    return {
        canDeleteMarker,
        deleteMarker,
        addMarker,
        getAllMarkersForMap,
        validateMarkerForm,
        canCreateMarker,
        listenForNewMarkers,
        listenForDeletedMarkers,
        listenForMarkerChangesOnMap,
        canCreateMarkerForMap,
        nonExpiredMarkers,
        displayableMarkers,
        isLoading,
        formErrors,
        markers,
        hasErrors,
        minCategoryNameLength,
        showExpired
    };
}