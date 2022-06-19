import userDevice from "@/classes/userDevice";
import { Map } from "@/types/map";
import { computed } from "@vue/reactivity";
import { PropType, defineEmits, getCurrentInstance, ref, reactive } from "vue";

const maps = ref<Map[]>([]);

// reactive maps
// const maps = reactive<Map[]>([]);


export function useMap() {

    const minCategoryNameLength = 3;

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

    const emit = getCurrentInstance()?.emit as any;

    const isLoading = ref(false);

    const formErrors = reactive<MapForm>({
        lat: "",
        lng: "",
        elevation: null,
        category_name: "",
        description: "",
        link: "",
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

    const addMap = (mapId: number | string, data: any) => {
        if (!userDevice.online) {
            return alert("You must be online to add a map.");
        }
        if (!validateMapForm(data)) {
            return;
        };
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
                    // localStorage["post_" + data.uuid] = data.token;
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
        return map.token || localStorage.getItem("post_" + map.uuid);
    };

    const deleteMap = (mapId: number | string, map: Map) => {
        if (!userDevice.online) {
            return alert("You must be online to delete a map.");
        }
        // Check that the map exists and that it has a token field
        if (map && canDeleteMap(map)) {
            // Delete the map
            fetch(`https://cartes.io/api/maps/${mapId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    token: map.token || localStorage.getItem("post_" + map.uuid),
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        localStorage.removeItem("post_" + map.uuid);
                        emit('deletedMap', map);
                    }
                })
                .catch((error) => {
                    alert(error);
                    console.error(error);
                });
        }
    };

    return {
        canDeleteMap,
        deleteMap,
        addMap,
        validateMapForm,
        getMap,
        getAllMaps,
        isLoading,
        formErrors,
        hasErrors,
        minCategoryNameLength,
        map,
        maps,
    };
}