import { ref } from "vue";
import $bus, { eventTypes } from "@/eventBus/events";
import userDevice from "@/classes/userDevice";
import { PusherPresenceChannel } from "laravel-echo/dist/channel";

const channel = ref(null as PusherPresenceChannel | null);

const usernameToUse = ref("Unknown user");

const trackedUsers = ref<Record<string, any>>({});

const trackSocketIdView = ref('');

export function usePusher() {

    const joinChannel = (mapId: string): PusherPresenceChannel | void => {
        if (!userDevice.online) {
            return alert("You need to be online to see live data");
        }

        channel.value = (window.Echo.join(`maps.${mapId}`) as PusherPresenceChannel)
            .joining((user: { username: any; socket_id: string | number; user: { username: any; }; }) => {
                trackedUsers.value[user.socket_id] = { ...trackedUsers.value[user.socket_id], username: user.user.username };
            })
            .leaving((user: { username: any; socket_id: string | number; }) => {
                delete trackedUsers.value[user.socket_id];

                if (user.socket_id == trackSocketIdView.value) {
                    trackSocketIdView.value = '';
                }
            })
            // We use .on instead of .here because it also returns the current user
            .on("pusher:subscription_succeeded", (subscription: any) => {
                $bus.$emit(eventTypes.connected_to_websocket_channel, "maps." + mapId);
                listenForLiveUserLocations(mapId);
                listenForLiveUserViews(mapId);

                usernameToUse.value = subscription.me.info.user.username;
                let subscriptionMembers = subscription.members;

                if (!subscriptionMembers) {
                    return;
                }

                // Remove self from list
                delete subscriptionMembers[subscription.myID];

                // Add all members to trackedUsers from subscriptionMembers object
                Object.keys(subscriptionMembers).forEach((socketId: string | number) => {
                    trackedUsers.value[subscriptionMembers[socketId].socket_id] = { ...trackedUsers.value[subscriptionMembers[socketId].socket_id], ...subscriptionMembers[socketId].user };
                });

                // Remove all trackedUsers not in the list
                Object.keys(trackedUsers.value).forEach((socketId: string | number) => {
                    if (!subscriptionMembers.find((member: { socket_id: string | number; }) => member.socket_id == socketId)) {
                        delete trackedUsers.value[socketId];
                    }
                });
            })
            .error((error: any) => {
                console.error(error);
            }) as PusherPresenceChannel;

        if (channel.value) {
            return channel.value;
        }
    }

    const setTrackSocketIdView = (socketId: string | null) => {
        if (!socketId) {
            trackSocketIdView.value = '';
            return;
        }

        if (trackSocketIdView.value == socketId) {
            return;
        }

        trackSocketIdView.value = socketId;

    };

    const listenForLiveUserViews = (mapId: string) => {
        if (!channel.value) {
            return;
        }

        channel.value
            // trackSocketIdView
            .listenForWhisper("user-view-updated", (data: any) => {
                trackedUsers.value[data.socketId] = { ...trackedUsers.value[data.socketId], view: data.view };
                if (data.socketId == trackSocketIdView.value) {
                    $bus.$emit(eventTypes.updated_tracked_view, data.view);
                }
            })
            .listenForWhisper("user-view-removed", (data: any) => {
                delete trackedUsers.value[data.socketId].view;
                if (data.socketId == trackSocketIdView.value) {
                    trackSocketIdView.value = '';
                }
            });
    }

    const leaveChannel = (mapId: string) => {
        if (channel.value) {
            window.Echo.leave("maps." + mapId);
            channel.value = null;
            $bus.$emit(eventTypes.left_websocket_channel, "maps." + mapId);
            trackedUsers.value = {};
            trackSocketIdView.value = '';
        }
    }

    const listenForLiveUserLocations = (mapId: string) => {
        if (!channel.value) {
            return;
        }

        channel.value
            .listenForWhisper("user-location-updated", (data: any) => {
                trackedUsers.value[data.socketId] = { ...trackedUsers.value[data.socketId], location: data.location };
            })
            .listenForWhisper("user-location-removed", (data: any) => {
                delete trackedUsers.value[data.socketId].location;
            });
    }

    return {
        usernameToUse,
        joinChannel,
        leaveChannel,
        listenForLiveUserLocations,
        setTrackSocketIdView,
        trackedUsers,
        channel,
        trackSocketIdView
    }
}