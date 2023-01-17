import { Channel } from "laravel-echo";
import { inject, ref } from "vue";
import $bus, { eventTypes } from "@/eventBus/events";
import userDevice from "@/classes/userDevice";
import { useUser } from "./user";

const channel = ref(null as Channel | null);

const { user } = useUser();

const usernameToUse = ref("Unknown user");

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

    return {
        usernameToUse,
        joinChannel,
        leaveChannel,
        channel
    }
}