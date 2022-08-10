import userDevice from "@/classes/userDevice";
import { Map, MapForm } from "@/types/map";
import { computed } from "@vue/reactivity";
import { getCurrentInstance, ref, reactive } from "vue";
import cartes from "@m-media/npm-cartes-io";
import $bus, { eventTypes } from "@/eventBus/events";
import { Marker } from "@/types/marker";
import { useUser } from "./user";

const { user } = useUser();

const maps = ref<Map[]>([]);

const totalMaps = ref(0);

const selectedMapUuid = ref('');

const map = computed(() => {
    return maps.value.find((m) => m.uuid === selectedMapUuid.value);
});

const isLoading = ref(false);

// reactive maps
// const maps = reactive<Map[]>([]);


export function useMap() {

    const minCategoryNameLength = 3;

    const emit = getCurrentInstance()?.emit as any;

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
        const data = await cartes.maps()
            .addParam('with[]', 'markers')
            .addParam('with[]', 'user')
            .addParam('with[]', 'publicContributors')
            .addParam('withCount[]', 'markers')
            .addParam('orderBy', 'markers_count')
            .get();
        maps.value = data.data;
        totalMaps.value = data.meta.total;
    }

    const getMap = async (mapId: string) => {
        if (!userDevice.online) {
            return alert("You must be online to get a map.");
        }
        selectedMapUuid.value = mapId;
        if (mapExistsInMapsArray(mapId)) {
            return map.value;
        }
        const data = await cartes.maps(mapId)
            .addParam('with[]', 'markers')
            .addParam('with[]', 'user')
            .addParam('with[]', 'publicContributors')
            .get();
        maps.value.push(data);
        return map.value;
    }

    const searchForMap = async (query: string) => {
        if (!userDevice.online) {
            return alert("You must be online to search for a map.");
        }
        if (query.length < minCategoryNameLength) {
            return;
        }
        const results = await cartes.maps().search(query);

        if (results.data.length > 0) {
            $bus.$emit(eventTypes.searched, {
                resource: 'map',
                query: query,
                results: results.data,
            });
        }

        return results;
    }

    const getMapIndexFromMapsArray = (mapId: string) => {
        return maps.value.findIndex((m) => m.uuid === mapId);
    }

    const mapExistsInMapsArray = (mapId: string) => {
        return getMapIndexFromMapsArray(mapId) !== -1;
    }

    const updateMapInMapArray = (mapId: string, data: any) => {
        const index = getMapIndexFromMapsArray(mapId);
        if (index !== -1) {
            // Update only the changed values
            maps.value[index] = {
                ...maps.value[index],
                ...data,
            };
        } else {
            maps.value.push(data);
        }
    }

    const addMarkersToMapInArray = (mapId: string, markers: Marker[]) => {
        if (mapExistsInMapsArray(mapId)) {
            const index = getMapIndexFromMapsArray(mapId);
            for (const marker of markers) {
                if (markerExistsInMapArray(mapId, marker.id)) {
                    updateMarkerInMarkerArray(mapId, marker.id, marker);
                    continue;
                }
                if (!maps.value[index].markers) {
                    maps.value[index].markers = [];
                    maps.value[index].markers?.push(marker);
                } else {
                    const mapMarkers = maps.value[index].markers;
                    const markerIndex = getMarkerIndexFromMarkerArray(mapId, marker.id);
                    if (markerIndex !== undefined && mapMarkers && markerIndex !== -1) {
                        mapMarkers[markerIndex] = marker;
                    } else if (mapMarkers) {
                        mapMarkers.push(marker);
                    }
                }
            }
        }
    }

    const updateMarkerInMarkerArray = (mapId: string, markerId: number, data: any) => {
        if (markerExistsInMapArray(mapId, markerId)) {
            const index = getMapIndexFromMapsArray(mapId);
            const mapMarkers = maps.value[index].markers;
            const markerIndex = getMarkerIndexFromMarkerArray(mapId, markerId);
            if (markerIndex !== undefined && mapMarkers && markerIndex !== -1) {
                mapMarkers[markerIndex] = {
                    ...mapMarkers[markerIndex],
                    ...data,
                };
            }
        }
    }

    const getMarkerIndexFromMarkerArray = (mapId: string, markerId: number) => {
        if (mapExistsInMapsArray(mapId)) {
            const index = getMapIndexFromMapsArray(mapId);
            return maps.value[index].markers?.findIndex((m) => m.id === markerId);
        }
        return -1;
    }

    const markerExistsInMapArray = (mapId: string, markerId: number) => {
        if (mapExistsInMapsArray(mapId)) {
            const markerIndex = getMarkerIndexFromMarkerArray(mapId, markerId);
            return markerIndex !== undefined && markerIndex !== -1;
        }
        return false;
    }

    const removeMarkerFromMarkerArray = (mapId: string, markerId: number) => {
        if (mapExistsInMapsArray(mapId)) {
            const mapIndex = getMapIndexFromMapsArray(mapId);
            maps.value[mapIndex].markers = maps.value[mapIndex].markers?.filter((m) => m.id !== markerId);
        }
        return;
    }

    const getRelatedMaps = async (mapId: string) => {
        if (!mapId) {
            return;
        }
        if (!userDevice.online) {
            return alert("You must be online to get related maps.");
        }
        updateMapInMapArray(mapId, { related: await cartes.maps(mapId).related().get() });
        return map.value?.related;
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

    const addMap = (formData = null as MapForm | null) => {
        if (formData && !validateMapForm(formData)) {
            return;
        };
        if (!userDevice.online) {
            return alert("You must be online to add a map.");
        }
        isLoading.value = true;
        return cartes.maps().create(formData)
            .then((data: Map) => {
                localStorage["map_" + data.uuid] = data.token;
                $bus.$emit(eventTypes.created_map, data);
                emit("addedMap", data);
                return data;
            }).catch((error) => {
                alert(error.message);
            }).finally(() => {
                isLoading.value = false;
            });
    };

    const canDeleteMap = (map: Map) => {
        return getMapToken(map) || (user && map.user && user.value?.id === map.user.id);
    };

    const canUpdateMap = (map: Map) => {
        return canDeleteMap(map);
    }

    const canCreateMarkers = (map: Map) => {
        if (!map) {
            return false;
        }
        return map.users_can_create_markers === 'yes' || getMapToken(map) || canUpdateMap(map);
    }

    const canCreateMarkersByMapId = (mapId: string) => {
        const map = maps.value.find((m) => m.uuid === mapId);
        if (!map) {
            return false;
        }
        return canCreateMarkers(map);
    }

    const getMapToken = (map: Map) => {
        return map.token || localStorage.getItem("map_" + map.uuid);
    }

    const wouldLinkToCurrentUser = (map: Map) => {
        // If the user can edit the map but the map.is_linked_to_user_is_false, return false
        if (canUpdateMap(map) && !map.is_linked_to_user) {
            return true;
        }
        return false;
    }

    const updateMap = async (map: Map, formData: MapForm) => {
        if (!canUpdateMap(map)) {
            return;
        }

        if (!userDevice.online) {
            return alert("You must be online to update a map.");
        }

        isLoading.value = true;
        const data = await cartes.maps(map.uuid, getMapToken(map)).update(formData);
        if (data.uuid) {
            $bus.$emit(eventTypes.updated_map, data);
            emit("updatedMap", data);
            updateMapInMapArray(map.uuid, data);
        }

        // If the map updated is the current one in the map, we need to update the map in the map
        if (data.uuid && map.uuid === data.uuid) {
            Object.assign(map, data);
        }

        isLoading.value = false;
    };

    const deleteMap = (map: Map) => {
        if (!userDevice.online) {
            return alert("You must be online to delete a map.");
        }
        // Check that the map exists and that it has a token field
        if (canDeleteMap(map)) {
            isLoading.value = true;

            // Delete the map
            cartes.maps(map.uuid, map.token ?? localStorage.getItem("map_" + map.uuid)).delete().then(() => {
                localStorage.removeItem("map_" + map.uuid);
                $bus.$emit(eventTypes.deleted_map, map);
                emit('deletedMap', map);
            })
                .catch((error) => {
                    alert(error.message);
                }).finally(() => {
                    isLoading.value = false;
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
        getRelatedMaps,
        getAllMaps,
        canCreateMarkers,
        updateMap,
        addMarkersToMapInArray,
        removeMarkerFromMarkerArray,
        canCreateMarkersByMapId,
        markerExistsInMapArray,
        getMapToken,
        wouldLinkToCurrentUser,
        searchForMap,
        isLoading,
        formErrors,
        hasErrors,
        minCategoryNameLength,
        map,
        maps,
        totalMaps,
    };
}