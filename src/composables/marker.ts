import userDevice from "@/classes/userDevice";
import { Map } from "@/types/map";
import { Marker, MarkerForm } from "@/types/marker";
import { computed } from "@vue/reactivity";
import { getCurrentInstance, ref, reactive, toRaw, onUnmounted } from "vue";
import { useMap } from "./map";
import cartes from "@m-media/npm-cartes-io";
import $bus, { eventTypes } from "@/eventBus/events";
import { usePusher } from "./pusher";

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

const { channel } = usePusher();

const trackedUserLocations = ref<Record<string, any>>({});

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

    const updateMarkerInMarkerArray = (marker: Marker, mapId = null as string | null) => {
        if (mapId) {
            Map.updateMarkerInMarkerArray(mapId, marker.id, marker);
        }
    }

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

        try {
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
        } catch (error) {
            alert("We could not add your marker at this time. Make sure it does not conflict with an existing marker and has no profanities in its description and category.");
        } finally {
            isLoading.value = false;
        }
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

    const updateMarker = async (mapId: string, marker: Marker) => {
        if (!userDevice.online) {
            return alert("You need to be online to update a marker");
        }
        if (canDeleteMarker(marker)) {
            const data = await cartes.maps(mapId).markers(marker.id, (marker.token || localStorage.getItem("post_" + marker.id))).update({
                lat: marker.location.coordinates[1],
                lng: marker.location.coordinates[0],
                description: marker.description,
            });
            updateMarkerInMarkerArray(data, mapId);

            $bus.$emit(eventTypes.updated_marker, data);
            if (emit) {
                emit('updatedMarker', data);
            }
        }
    }

    const listenForNewMarkers = async (mapId: string) => {
        if (!channel.value) {
            return;
        }
        channel.value.listen(
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

    const listenForUpdatedMarker = async (mapId: string) => {
        if (!channel.value) {
            return;
        }
        channel.value.listen(
            "MarkerUpdated",
            (e: { marker: Marker; }) => {
                if (e.marker.category.icon && !e.marker.category.icon.startsWith("https")) {
                    e.marker.category.icon = "/marker.svg";
                }
                updateMarkerInMarkerArray(e.marker, mapId);
                $bus.$emit(eventTypes.updated_marker_via_websocket, e.marker);
                if (emit) {
                    emit("updatedMarker", e.marker);
                }
            });
    }

    const listenForDeletedMarkers = async (mapId: string) => {
        if (!channel.value) {
            return;
        }
        channel.value.listen(
            "MarkerDeleted",
            (e: { marker: Marker; }) => {
                removeMarkerFromMarkerArray(e.marker, mapId);
                $bus.$emit(eventTypes.deleted_marker_via_websocket, e.marker);
            }
        );
    }

    const listenForAmountOfUsers = async (mapId: string) => {
        if (!channel.value) {
            return;
        }
        // @ts-ignore on() does actually exist
        channel.value.on("pusher:subscription_count", function (count) {
            Map.setAmountOfUsersCurrentlyConnectedToMap(mapId, count.subscription_count);
        });
    }

    const listenForLiveUserLocations = async (mapId: string) => {
        if (!channel.value) {
            return;
        }
        // We need to send it using Pusher's client event system. For that, we need to get and use the pusher instance from the Echo channel
        // @ts-ignore
        const pusher = channel.value.pusher as Pusher;

        pusher.channel("maps." + mapId)
            .bind("client-user-location-updated", (data: any) => {
                trackedUserLocations.value[data.socketId] = data.location;
            })
            .bind("client-user-location-removed", (data: any) => {
                delete trackedUserLocations.value[data.socketId];
            });
    }

    const listenForMarkerChangesOnMap = async (mapId: string) => {
        if (!channel.value) {
            return;
        }

        listenForDeletedMarkers(mapId);
        listenForNewMarkers(mapId);
        listenForUpdatedMarker(mapId);
        listenForAmountOfUsers(mapId);
        listenForLiveUserLocations(mapId);
    }

    // Use the Haversine formula to calculate the distance between two points
    // https://en.wikipedia.org/wiki/Haversine_formula
    const computeDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // in metres
        return d;
    }

    const computeBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const y = Math.sin(Δλ) * Math.cos(φ2);

        const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

        const θ = Math.atan2(y, x);

        return (θ * 180 / Math.PI + 360) % 360;
    }

    // Format the distance in meters or kilometers depending on the distance
    const formatDistance = (distance: number) => {
        if (distance < 1000) {
            return distance.toFixed(0) + " meters";
        }
        return (distance / 1000).toFixed(1) + " kilometers";
    }

    const formatBearing = (bearing: number) => {
        if (bearing < 22.5) {
            return "North";
        }
        if (bearing < 67.5) {
            return "North-East";
        }
        if (bearing < 112.5) {
            return "East";
        }
        if (bearing < 157.5) {
            return "South-East";
        }
        if (bearing < 202.5) {
            return "South";
        }
        if (bearing < 247.5) {
            return "South-West";
        }
        if (bearing < 292.5) {
            return "West";
        }
        if (bearing < 337.5) {
            return "North-West";
        }
        return "North";
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
        updateMarker,
        computeDistance,
        formatDistance,
        computeBearing,
        formatBearing,
        trackedUserLocations,
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