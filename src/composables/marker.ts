import userDevice from "@/classes/userDevice";
import { Map } from "@/types/map";
import { Marker, MarkerForm } from "@/types/marker";
import { computed } from "@vue/reactivity";
import { getCurrentInstance, ref, reactive, toRaw, onUnmounted } from "vue";
import { useMap } from "./map";
import cartes from "@m-media/npm-cartes-io";
import $bus, { eventTypes } from "@/eventBus/events";
import { Channel } from "laravel-echo";

const Map = useMap();

// const markers = ref<Marker[]>([]);

const markers = computed(() => {
    if (!Map.map.value) {
        return [];
    }
    return Map.map.value.markers ?? [];
});


const showExpired = ref(false);

const nonExpiredMarkers = computed(() => {
    if (!markers.value) {
        return [];
    }
    return markers.value.filter((m) => !m.expires_at || new Date(m.expires_at) > new Date());
})

// const markersInTimeframe = computed(() => {
//     return markers.value.filter((m) => {
//         if (!m.expires_at) {
//             return true;
//         }
//         return m.expires_at > fromTime.value && m.expires_at < toTime.value;
//     }
//     )
// });

const displayableMarkers = computed(() => {
    if (showExpired.value) {
        return markers.value;
    }
    return nonExpiredMarkers.value;
})

const minCategoryNameLength = 3;

export function useMarker() {

    const emit = getCurrentInstance()?.emit;

    const isLoading = ref(false);

    const formErrors = reactive<MarkerForm>({
        lat: "",
        lng: "",
        elevation: null,
        category_name: "",
        description: "",
        link: "",
    });

    const addMarkerToMarkerArray = (marker: Marker, mapId = null as string | null) => {
        if (mapId) {
            Map.addMarkersToMapInArray(mapId, [marker]);
        }
        // if (!markerExistsInArray(marker)) {
        //     markers.value?.push(marker);
        // } else {
        //     updateMarkerInMarkerArray(marker);
        // }
    }

    // const updateMarkerInMarkerArray = (marker: Marker) => {
    //     const index = markers.value?.findIndex((m) => m.id === marker.id);
    //     if (index !== -1 && markers.value && index) {
    //         // Get all the current marker values
    //         const currentMarker = markers.value[index];
    //         // Update only the changed values
    //         markers.value[index] = {
    //             ...currentMarker,
    //             ...marker,
    //         };
    //     }
    // }

    // const markerExistsInArray = (marker: Marker) => {
    //     return !!markers.value?.find(m => m.id === marker.id);
    // }

    const markerExistsInArrayForMapId = (marker: Marker, mapId: string) => {
        return Map.markerExistsInMapArray(mapId, marker.id);
    }

    const removeMarkerFromMarkerArray = (marker: Marker, mapId = null as null | string) => {
        if (mapId) {
            Map.removeMarkerFromMarkerArray(mapId, marker.id);
        }
        // markers.value = markers.value?.filter((m) => m.id !== marker.id);
    }

    const hasErrors = computed(() => {
        return Object.values(formErrors).some((error) => error !== "");
    });

    const getAllMarkersForMap = async (mapId: string) => {
        if (!mapId) {
            return;
        }

        if (!userDevice.online) {
            return alert("You need to be online to add a marker");
        }

        const data = await cartes.maps(mapId).markers().addParam('show_expired', 'true').get();

        if (!data) {
            return [];
        }

        data.forEach((marker: Marker) => {
            if (marker.category.icon && !marker.category.icon.startsWith("https")) {
                marker.category.icon = "/marker.svg";
            }
        });

        // markers.value = data;

        Map.addMarkersToMapInArray(mapId, data);

        return data as Marker[];
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

    const canCreateMarkerForMapByMapId = (mapId: string) => {
        return Map.canCreateMarkersByMapId(mapId);
    }

    const canCreateMarker = () => {
        if (!Map.map.value) {
            return false;
        }
        return canCreateMarkerForMap(Map.map.value);
    }

    const addMarker = async (mapId: string, formData: MarkerForm) => {
        if (!canCreateMarkerForMapByMapId(mapId)) {
            return alert("You need to be logged in to add a marker");
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
            addMarkerToMarkerArray(data, mapId);
            localStorage["post_" + data.id] = data.token;
            $bus.$emit(eventTypes.created_marker, data);
            if (emit) {
                emit("addedMarker", data);
            }
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
            removeMarkerFromMarkerArray(marker, mapId);
            localStorage.removeItem("post_" + marker.id);
            $bus.$emit(eventTypes.deleted_marker, toRaw(marker));
            if (emit) {
                emit('deletedMarker', marker);
            }
        }
    };

    const joinChannel = (mapId: string): Channel | void => {
        if (!userDevice.online) {
            return alert("You need to be online to see live data");
        }
        onUnmounted(() => {
            window.Echo.leave("maps." + mapId);
        });
        return window.Echo.channel("maps." + mapId).subscribed(() => {
            $bus.$emit(eventTypes.connected_to_websocket_channel, "maps." + mapId);
        });
    }

    const listenForNewMarkers = async (channel: Channel, mapId: string) => {
        channel.listen(
            "MarkerCreated",
            (e: { marker: Marker; }) => {
                if (e.marker.category.icon && !e.marker.category.icon.startsWith("https")) {
                    e.marker.category.icon = "/marker.svg";
                }
                if (markerExistsInArrayForMapId(e.marker, mapId)) {
                    return;
                }
                addMarkerToMarkerArray(e.marker, mapId);
                $bus.$emit(eventTypes.created_marker_via_websocket, e.marker);
                if (emit) {
                    emit("addedMarker", e.marker);
                }
            }
        );

    }

    const listenForUpdatedMarker = async (channel: Channel, mapId: string) => {
        channel.listen(
            "MarkerUpdated",
            (e: { marker: Marker; }) => {
                if (e.marker.category.icon && !e.marker.category.icon.startsWith("https")) {
                    e.marker.category.icon = "/marker.svg";
                }
                $bus.$emit(eventTypes.updated_marker_via_websocket, e.marker);
                if (emit) {
                    emit("updatedMarker", e.marker);
                }
            });
    }

    const listenForDeletedMarkers = async (channel: Channel, mapId: string) => {
        channel.listen(
            "MarkerDeleted",
            (e: { marker: Marker; }) => {
                removeMarkerFromMarkerArray(e.marker, mapId);
                $bus.$emit(eventTypes.deleted_marker_via_websocket, e.marker);
            }
        );
    }

    const listenForAmountOfUsers = async (channel: Channel, mapId: string) => {
        // @ts-ignore on() does actually exist
        channel.on("pusher:subscription_count", function (count) {
            Map.setAmountOfUsersCurrentlyConnectedToMap(mapId, count.subscription_count);
        });
    }

    const listenForMarkerChangesOnMap = async (mapId: string) => {
        const channel = joinChannel(mapId);
        if (!channel) {
            return;
        }
        listenForDeletedMarkers(channel, mapId);
        listenForNewMarkers(channel, mapId);
        listenForUpdatedMarker(channel, mapId);
        listenForAmountOfUsers(channel, mapId);
    }

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
        canCreateMarkerForMapByMapId,
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