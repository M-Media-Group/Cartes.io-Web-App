import { Channel } from "laravel-echo";
import { inject, ref } from "vue";
import $bus, { eventTypes } from "@/eventBus/events";
import userDevice from "@/classes/userDevice";
import { useUser } from "./user";

const channel = ref(null as Channel | null);

const { user } = useUser();

const usernameToUse = ref("Unknown user");

const trackedUsers = ref<Record<string, any>>({});

const computeUsernameToUse = () => {
    if (user.value?.is_public && user.value?.username) {
        return user.value.username;
    }

    const randomName = Math.floor(Math.random() * 10000);

    if (!user.value?.is_public && user.value?.username) {
        return "Cartes.io user " + randomName;
    }
    return "Anonymous " + randomName;
}

export function usePusher() {

    const joinChannel = async (mapId: string): Promise<Channel | void> => {
        if (!userDevice.online) {
            return alert("You need to be online to see live data");
        }

        channel.value = await window.Echo.channel("maps." + mapId).subscribed(() => {
            usernameToUse.value = computeUsernameToUse();

            $bus.$emit(eventTypes.connected_to_websocket_channel, "maps." + mapId);

            listenForLiveUserLocations(mapId);

            window.Echo.connector.pusher.channel("maps." + mapId).trigger("client-joined-channel", {
                socketId: window.Echo.socketId(),
                username: usernameToUse.value,
            });
        });

        if (channel.value) {
            return channel.value;
        }
    }

    const leaveChannel = async (mapId: string) => {
        if (channel.value) {
            await window.Echo.connector.pusher.channel("maps." + mapId).trigger("client-left-channel", {
                socketId: window.Echo.socketId(),
            });

            channel.value = await window.Echo.leave("maps." + mapId) ?? null;
            $bus.$emit(eventTypes.left_websocket_channel, "maps." + mapId);
        }
    }

    const listenForLiveUserLocations = async (mapId: string) => {
        if (!channel.value) {
            return;
        }
        // We need to send it using Pusher's client event system. For that, we need to get and use the pusher instance from the Echo channel
        // @ts-ignore
        const pusher = channel.value.pusher as Pusher;

        pusher.channel("maps." + mapId)
            .bind("client-joined-channel", (data: any) => {
                trackedUsers.value[data.socketId] = { username: data.username };

                // Emit self to other users
                pusher.channel("maps." + mapId).trigger("client-in-channel", {
                    socketId: window.Echo.socketId(),
                    username: usernameToUse.value,
                });
            })
            .bind("client-in-channel", (data: any) => {
                trackedUsers.value[data.socketId] = { ...trackedUsers.value[data.socketId], username: data.username };
            })
            .bind("client-user-location-updated", (data: any) => {
                trackedUsers.value[data.socketId] = { ...trackedUsers.value[data.socketId], location: data.location };
            })
            .bind("client-user-location-removed", (data: any) => {
                delete trackedUsers.value[data.socketId];
            })
            .bind("client-left-channel", (data: any) => {
                delete trackedUsers.value[data.socketId];
            });
    }

    return {
        usernameToUse,
        joinChannel,
        leaveChannel,
        listenForLiveUserLocations,
        trackedUsers,
        channel
    }
}