import Pusher from "pusher-js/types/src/core/pusher";
import { ref, toRaw, watch } from "vue";
import { useMap } from "./map";
import { useMapPosition } from "./mapPosition";
import { usePusher } from "./pusher";
import { useUser } from "./user";
import $bus, { eventTypes } from "@/eventBus/events";

const Map = useMap();

const followSocketId = ref<string | null>(null);

const isSharingLocation = ref(false);

const mapPosition = useMapPosition();

const user = useUser();

const { channel } = usePusher();

export function useLiveMapTracking() {

    const shareUsersLocation = () => {
        if (!user.currentLocation.value || !user.locationWatcherId.value) {
            return;
        }

        if (!channel.value) {
            return;
        }

        // We need to send it using Pusher's client event system. For that, we need to get and use the pusher instance from the Echo channel
        // @ts-ignore
        const pusher = channel.value.pusher as Pusher;

        pusher.channel("maps." + Map.map.value?.uuid).trigger("client-user-location-updated",
            {
                socketId: window.Echo.socketId(),
                location: {
                    latitude: user.currentLocation.value.latitude,
                    longitude: user.currentLocation.value.longitude,
                    zoom: mapPosition.zoom.value,
                },
            }
        );
    }

    const stopSharingLocation = () => {
        if (!channel.value) {
            return;
        }

        // We need to send it using Pusher's client event system. For that, we need to get and use the pusher instance from the Echo channel
        // @ts-ignore
        const pusher = channel.value.pusher as Pusher;

        pusher.channel("maps." + Map.map.value?.uuid).trigger("client-user-location-removed", {
            socketId: window.Echo.socketId(),
        });
    };

    // In order to share the users location on the websocket, we need to listen for currentLocation changes and emit them to the websocket if the user is sharing their location
    watch(user.currentLocation, () => {
        if (!isSharingLocation.value) {
            return;
        }
        shareUsersLocation();
    });

    const toggleShareLocation = () => {
        isSharingLocation.value = !isSharingLocation.value;

        if (isSharingLocation.value) {
            shareUsersLocation();
            $bus.$emit(eventTypes.started_sharing_location, toRaw(Map.map.value?.uuid));
        } else {
            stopSharingLocation();
            $bus.$emit(eventTypes.stopped_sharing_location, toRaw(Map.map.value?.uuid));
        }
    }

    $bus.$on(eventTypes.disabled_location, () => {
        if (isSharingLocation.value) {
            toggleShareLocation();
        }
    });

    // @todo - this won't work because by this time the channel.value will be null
    $bus.$on(eventTypes.left_websocket_channel, () => {
        if (isSharingLocation.value) {
            toggleShareLocation();
        }
    });

    return {
        isSharingLocation,
        followSocketId,
        shareUsersLocation,
        toggleShareLocation
    }
}