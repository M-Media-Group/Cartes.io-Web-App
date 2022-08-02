import userDevice from "@/classes/userDevice";
import { Map, MapForm } from "@/types/map";
import { computed } from "@vue/reactivity";
import { PropType, defineEmits, getCurrentInstance, ref, reactive } from "vue";
import cartes from "@m-media/npm-cartes-io";
import $bus, { eventTypes } from "@/eventBus/events";

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
    related: [],
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
        const data = await cartes.maps().get();
        maps.value = data.data;
    }

    const getMap = async (mapId: string) => {
        if (!userDevice.online) {
            return alert("You must be online to get a map.");
        }
        const data = await cartes.maps(mapId).get();
        Object.assign(map, data) // equivalent to reassign
    }

    const getRelatedMaps = async (mapId: string) => {
        if (!userDevice.online) {
            return alert("You must be online to get related maps.");
        }
        map.related = await cartes.maps(mapId).related().get();
        return map.related;
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

    const addMap = async (formData = null as MapForm | null, redirect = false) => {
        if (formData && !validateMapForm(formData)) {
            return;
        };
        if (!userDevice.online) {
            return alert("You must be online to add a map.");
        }
        isLoading.value = true;
        const data = await cartes.maps().create(formData);
        localStorage["map_" + data.uuid] = data.token;
        if (redirect) {
            window.location.href = "?mapId=" + data.uuid;
            $bus.$emit(eventTypes.created_map, data);
        }
        emit("addedMap", data);

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

    const updateMap = async (map: Map, formData: MapForm) => {
        if (!canUpdateMap(map)) {
            return;
        }
        if (!userDevice.online) {
            return alert("You must be online to update a map.");
        }

        isLoading.value = true;
        const data = await cartes.maps(map.uuid, map.token || localStorage.getItem("map_" + map.uuid)).update(formData);
        if (data.uuid) {
            $bus.$emit(eventTypes.updated_map, data);
            emit("updatedMap", data);

            // If the map updated, we need to update the map in the maps array
            const mapIndex = maps.value.findIndex((m) => m.uuid === data.uuid);
            if (mapIndex > -1) {
                maps.value[mapIndex] = data;
            }
        }

        // If the map updated is the current one in the map, we need to update the map in the map
        if (data.uuid && map.uuid === data.uuid) {
            Object.assign(map, data);
        }

        isLoading.value = false;
    };

    const deleteMap = async (map: Map) => {
        if (!userDevice.online) {
            return alert("You must be online to delete a map.");
        }
        // Check that the map exists and that it has a token field
        if (canDeleteMap(map)) {
            // Delete the map
            await cartes.maps(map.uuid, map.token ?? localStorage.getItem("map_" + map.uuid)).delete();
            localStorage.removeItem("map_" + map.uuid);
            $bus.$emit(eventTypes.deleted_map, map);
            window.location.href = "/";
            emit('deletedMap', map);
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
        isLoading,
        formErrors,
        hasErrors,
        minCategoryNameLength,
        map,
        maps,
    };
}