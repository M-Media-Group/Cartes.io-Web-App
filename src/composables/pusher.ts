import { Channel, PresenceChannel } from "laravel-echo";
import { ref } from "vue";
import $bus, { eventTypes } from "@/eventBus/events";
import userDevice from "@/classes/userDevice";
import { useUser } from "./user";
import { PusherPresenceChannel } from "laravel-echo/dist/channel";

const channel = ref(null as PusherPresenceChannel | null);

const usernameToUse = ref("Unknown user");

const trackedUsers = ref<Record<string, any>>({});

const trackSocketIdView = ref('');

export function usePusher() {

    const joinChannel = async (mapId: string): Promise<Channel | void> => {
        if (!userDevice.online) {
            return alert("You need to be online to see live data");
        }

        channel.value = await window.Echo.join(`maps.${mapId}`)
            .here((users: any[]) => {
                console.log("Got users", users)

                $bus.$emit(eventTypes.connected_to_websocket_channel, "maps." + mapId);

                users.forEach((data: { socket_id: string | number; user: { username: any; }; }) => {
                    if (data.socket_id == window.Echo.socketId()) {
                        return;
                    }
                    trackedUsers.value[data.socket_id] = { username: data.user.username };
                });

                usernameToUse.value = users.find((u: any) => u.socket_id == window.Echo.socketId())?.user.username ?? "Unknown user";

                listenForLiveUserLocations(mapId);
            })
            .joining((user: { username: any; socket_id: string | number; user: { username: any; }; }) => {
                console.log(user.username);
                trackedUsers.value[user.socket_id] = { username: user.user.username };
            })
            .leaving((user: { username: any; socket_id: string | number; }) => {
                console.log(user.username);
                delete trackedUsers.value[user.socket_id];
            })
            .error((error: any) => {
                console.error(error);
            });

        if (channel.value) {
            return channel.value;
        }
    }

    const leaveChannel = async (mapId: string) => {
        if (channel.value) {
            channel.value = await window.Echo.leave("maps." + mapId) ?? null;
            $bus.$emit(eventTypes.left_websocket_channel, "maps." + mapId);
        }
    }

    const listenForLiveUserLocations = (mapId: string) => {
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
            })
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
        trackedUsers,
        channel,
        trackSocketIdView
    }
}