import { ref, toRaw, watch, WatchStopHandle } from "vue";
import { useMap } from "./map";
import { useMapPosition } from "./mapPosition";
import { usePusher } from "./pusher";
import { useUser } from "./user";
import $bus, { eventTypes } from "@/eventBus/events";
import { useMarker } from "./marker";

const Map = useMap();

const followSocketId = ref<string | null>(null);

const isSharingLocation = ref(false);
const isSharingView = ref(false);

const mapPosition = useMapPosition();

const user = useUser();

const { channel } = usePusher();

const { computeDistance } = useMarker();

let locationWatcher: WatchStopHandle, viewWatcher: WatchStopHandle;

export function useLiveMapTracking() {

    const shareUsersLocation = () => {
        if (!isSharingLocation.value) {
            return;
        }

        if (!user.currentLocation.value || !user.locationWatcherId.value) {
            return;
        }

        if (!channel.value) {
            return;
        }

        channel.value.whisper("user-location-updated",
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

        channel.value.whisper("user-location-removed", {
            socketId: window.Echo.socketId(),
        });
    };

    const toggleShareLocation = () => {

        // @TODO Confirm the user action
        // if (!isSharingLocation.value && !confirm("Anyone looking at this map will be able to see your location. Are you sure you want to share your location?")) {
        //     return false;
        // }

        isSharingLocation.value = !isSharingLocation.value;

        if (isSharingLocation.value) {
            locationWatcher = watch(user.currentLocation, () => {
                shareUsersLocation();
            }, { immediate: true });
            $bus.$emit(eventTypes.started_sharing_location, toRaw(Map.map.value?.uuid));
        } else {
            stopSharingLocation();
            locationWatcher?.();
            $bus.$emit(eventTypes.stopped_sharing_location, toRaw(Map.map.value?.uuid));
        }
    }

    const shareUsersView = () => {
        if (!channel.value) {
            return;
        }

        channel.value.whisper("user-view-updated",
            {
                socketId: window.Echo.socketId(),
                view: {
                    lat: mapPosition.center.value.lat,
                    lng: mapPosition.center.value.lng,
                    zoom: mapPosition.zoom.value,
                },
            });
    }

    const stopSharingView = () => {
        if (!channel.value) {
            return;
        }

        channel.value.whisper("user-view-removed", {
            socketId: window.Echo.socketId(),
        });
    };

    const lastTimeViewWasUpdated = ref(0);

    const toggleShareView = () => {
        isSharingView.value = !isSharingView.value;

        if (isSharingView.value) {
            viewWatcher = watch(() => mapPosition.center.value, (oldVal, newVal) => {

                // These two next if statements are to prevent the view from being updated too often and sending too many events
                // If the last event was less than 0.5 second ago, don't send another one
                if (Date.now() - lastTimeViewWasUpdated.value < 500) {
                    return;
                }
                console.log("newVal", newVal, "oldVal", oldVal);
                if (newVal && oldVal && computeDistance(oldVal.lat, oldVal.lng, newVal.lat, newVal.lng) < 3) {
                    return;
                }

                shareUsersView();

                lastTimeViewWasUpdated.value = Date.now();
            }, { immediate: true });

            // $bus.$emit(eventTypes.started_sharing_view, toRaw(Map.map.value?.uuid));
        }
        else {
            stopSharingView();
            viewWatcher?.();
            // $bus.$emit(eventTypes.stopped_sharing_view, toRaw(Map.map.value?.uuid));
        }
    }



    const stopAll = () => {
        if (isSharingLocation.value) {
            toggleShareLocation();
        }
        if (isSharingView.value) {
            toggleShareView();
        }
    }

    $bus.$on(eventTypes.disabled_location, stopAll);

    // @todo - this won't work because by this time the channel.value will be null
    $bus.$on(eventTypes.left_websocket_channel, stopAll);

    return {
        isSharingLocation,
        isSharingView,
        followSocketId,
        shareUsersLocation,
        toggleShareLocation,
        toggleShareView
    }
}