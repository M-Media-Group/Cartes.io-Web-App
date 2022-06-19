import userDevice from "@/classes/userDevice";
import { Map, MapForm } from "@/types/map";
import { computed } from "@vue/reactivity";
import { PropType, defineEmits, getCurrentInstance, ref, reactive } from "vue";

const maps = ref<Map[]>([]);

// reactive map
const map = reactive<Map>({
    uuid: "",
    title: "",
    slug: "",
    description: "",
    created_at: new Date(),
    updated_at: new Date(),
    privacy: "unlisted",
    users_can_create_markers: "only_logged_in",
    options: {
        links: "optional",
        default_expiration_time: null,
        limit_to_geographical_body_type: "no",
    },
    categories: [],
    markers: [],
});
// reactive maps
// const maps = reactive<Map[]>([]);


export function useMap() {

    const minCategoryNameLength = 3;

    const emit = getCurrentInstance()?.emit as any;

    const isLoading = ref(false);

    const formErrors = reactive<MapForm>({
        title: null,
        slug: null,
        description: null,
        privacy: null,
        users_can_create_markers: null,
    });

    const getAllMaps = async () => {
        if (!userDevice.online) {
            return alert("You must be online to get all maps.");
        }
        // Fetch the maps from the api https://cartes.io/api/maps
        fetch("https://cartes.io/api/maps")
            .then((response) => response.json())
            .then((data) => {
                maps.value = data.data;
                return data.data;
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    const getMap = (mapId: string | number) => {
        if (!userDevice.online) {
            return alert("You must be online to get a map.");
        }
        // Fetch the markers from the api https://cartes.io/api/maps/3bdc0bdc-8a77-40e3-8c34-c70466443980
        fetch("https://cartes.io/api/maps/" + mapId)
            .then((response) => response.json())
            .then((data) => {
                Object.assign(map, data) // equivalent to reassign
            }
            )
            .catch((error) => {
                console.error("Error:", error);
            }
            );
    }

    const hasErrors = computed(() => {
        return Object.values(formErrors).some((error) => error !== "");
    });

    const validateMapForm = (form: MapForm) => {
        if (form.title && form.title.length < minCategoryNameLength) {
            formErrors.title = "Enter a valid title";
        }
        return !hasErrors.value;
    };

    const addMap = (data = null as MapForm | null, redirect = false) => {
        if (data && !validateMapForm(data)) {
            return;
        };
        if (!userDevice.online) {
            return alert("You must be online to add a map.");
        }
        isLoading.value = true;
        fetch("https://cartes.io/api/maps", {
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
                        throw new Error("You are not authorized to add maps to this map.");
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
                        throw new Error("You are creating maps too quickly. Please wait a moment and try again.");
                    default:
                        throw new Error("The server encountered an error.");
                }
            })
            .then((data: Map) => {
                if (data.uuid) {
                    // if (data.category.icon && !data.category.icon.startsWith("https")) {
                    //     data.category.icon = "/map.svg";
                    // }
                    console.log("New map: ", data);
                    localStorage["map_" + data.uuid] = data.token;
                    if (redirect) {
                        window.location.href = "?mapId=" + data.uuid;
                    }
                    emit("addedMap", data);
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

    const canDeleteMap = (map: Map) => {
        return map.token || localStorage.getItem("map_" + map.uuid);
    };

    const canUpdateMap = (map: Map) => {
        return canDeleteMap(map);
    }

    const canCreateMarkers = (map: Map) => {
        return map.users_can_create_markers === 'yes' || map.token || localStorage.getItem("map_" + map.uuid);
    }

    const deleteMap = (map: Map) => {
        if (!userDevice.online) {
            return alert("You must be online to delete a map.");
        }
        // Check that the map exists and that it has a token field
        if (canDeleteMap(map)) {
            // Delete the map
            fetch(`https://cartes.io/api/maps/${map.uuid}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    token: map.token || localStorage.getItem("map_" + map.uuid),
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        localStorage.removeItem("map_" + map.uuid);
                        alert("Map deleted.");
                        window.location.href = "/";
                        emit('deletedMap', map);
                    }
                })
                .catch((error) => {
                    alert(error);
                    console.error(error);
                });
        } else {
            alert("This map could not be deleted.");
        }
    };

    return {
        canDeleteMap,
        canUpdateMap,
        deleteMap,
        addMap,
        validateMapForm,
        getMap,
        getAllMaps,
        canCreateMarkers,
        isLoading,
        formErrors,
        hasErrors,
        minCategoryNameLength,
        map,
        maps,
    };
}