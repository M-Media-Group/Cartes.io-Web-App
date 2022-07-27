import userDevice from "@/classes/userDevice";
import { Map } from "@/types/map";
import { Marker, MarkerForm } from "@/types/marker";
import { computed } from "@vue/reactivity";
import { PropType, defineEmits, getCurrentInstance, ref, reactive } from "vue";
import { useMap } from "./map";

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
        markers.value.push(marker);
    }

    const removeMarkerFromMarkerArray = (marker: Marker) => {
        markers.value = markers.value.filter((m) => m.id !== marker.id);
    }

    const hasErrors = computed(() => {
        return Object.values(formErrors).some((error) => error !== "");
    });

    const getAllMarkersForMap = (mapId: string | number) => {
        if (!userDevice.online) {
            return alert("You need to be online to add a marker");
        }
        // Fetch the markers from the api https://cartes.io/api/maps/3bdc0bdc-8a77-40e3-8c34-c70466443980/markers
        fetch("https://cartes.io/api/maps/" + mapId + "/markers", {
            headers: {
                'Accept': 'application/json'
            }
        })
            .then((response) => response.json())
            .then((data) => {

                data.forEach((marker: Marker) => {
                    if (marker.category.icon && !marker.category.icon.startsWith("https")) {
                        marker.category.icon = "/marker.svg";
                    }
                });

                markers.value = data;
            })
            .catch((error) => {
                console.error("Error:", error);
            });
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

    const addMarker = (mapId: number | string, data: any) => {
        if (Map.map.uuid == mapId) {
            if (!canCreateMarker()) {
                return alert("You need to be logged in to add a marker");
            }
        }
        if (!validateMarkerForm(data)) {
            return;
        };
        if (localStorage.getItem("map_" + mapId)) {
            data.map_token = localStorage.getItem("map_" + mapId);
        }
        if (!userDevice.online) {
            return alert("You need to be online to add a marker");
        }
        isLoading.value = true;
        fetch("https://cartes.io/api/maps/" + mapId + "/markers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                // Switch the response codes to determine the message
                switch (response.status) {
                    case 400:
                        return response.json().then((data) => {
                            throw new Error(data.message);
                        });
                    case 401:
                        throw new Error("You are not logged in.");
                    case 403:
                        throw new Error("You are not authorized to add markers to this map.");
                    case 404:
                        throw new Error("The map does not exist.");
                    case 422:
                        return response.json().then((data) => {
                            console.error("Malformed data: ", data);
                            // Fill the formErrors
                            Object.keys(data.errors).forEach((key) => {
                                // @ts-ignore
                                formErrors[key] = data.errors[key][0];
                            });

                            throw new Error(data.message);
                        });
                    case 429:
                        throw new Error("You are creating markers too quickly. Please wait a moment and try again.");
                    default:
                        throw new Error("The server encountered an error.");
                }
            })
            .then((data: Marker) => {
                if (data.id) {
                    if (data.category.icon && !data.category.icon.startsWith("https")) {
                        data.category.icon = "/marker.svg";
                    }
                    addMarkerToMarkerArray(data);
                    localStorage["post_" + data.id] = data.token;
                    emit("addedMarker", data);
                }
            })
            .catch((error) => {
                alert(error.message || "An unknown request error occurred.");
                console.error("Error:", error);
            })
            .finally(() => {
                isLoading.value = false;
            });
    };

    const canDeleteMarker = (marker: Marker) => {
        return marker.token || localStorage.getItem("post_" + marker.id);
    };

    const deleteMarker = (mapId: number | string, marker: Marker) => {
        if (!userDevice.online) {
            return alert("You need to be online to delete a marker");
        }
        // Check that the marker exists and that it has a token field
        if (canDeleteMarker(marker)) {
            // Delete the marker
            fetch(`https://cartes.io/api/maps/${mapId}/markers/${marker.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    token: marker.token || localStorage.getItem("post_" + marker.id),
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        removeMarkerFromMarkerArray(marker);
                        localStorage.removeItem("post_" + marker.id);
                        emit('deletedMarker', marker);
                    }
                })
                .catch((error) => {
                    alert(error);
                    console.error(error);
                });
        }
    };

    return {
        canDeleteMarker,
        deleteMarker,
        addMarker,
        getAllMarkersForMap,
        validateMarkerForm,
        canCreateMarker,
        isLoading,
        formErrors,
        markers,
        hasErrors,
        minCategoryNameLength
    };
}