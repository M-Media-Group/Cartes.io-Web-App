import { Marker, MarkerForm } from "@/types/marker";
import { computed } from "@vue/reactivity";
import { PropType, defineEmits, getCurrentInstance, ref, reactive } from "vue";

export function useMarker() {

    const markers = ref<Marker[]>([]);

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

    const hasErrors = computed(() => {
        return Object.values(formErrors).some((error) => error !== "");
    });

    const getAllMarkersForMap = (mapId: string | number) => {
        // Fetch the markers from the api https://cartes.io/api/maps/3bdc0bdc-8a77-40e3-8c34-c70466443980/markers
        fetch("https://cartes.io/api/maps/" + mapId + "/markers")
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

    const addMarker = (mapId: number | string, data: any) => {
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
        console.log("deleteMarker", marker.id);
        // Check that the marker exists and that it has a token field
        if (marker && canDeleteMarker(marker)) {
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
        isLoading,
        formErrors,
        markers,
        hasErrors,
    };
}