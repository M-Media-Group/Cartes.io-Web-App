import { Channel } from "laravel-echo";
import { inject, onUnmounted, ref } from "vue";
import $bus, { eventTypes } from "@/eventBus/events";
import userDevice from "@/classes/userDevice";

const channel = ref(null as Channel | null);

export function usePusher() {
    const isLive = inject('isConnectedToPusher');

    const joinChannel = (mapId: string): Channel | void => {
        if (!userDevice.online) {
            return alert("You need to be online to see live data");
        }

        onUnmounted(() => {
            window.Echo.leave("maps." + mapId);
        });

        channel.value = window.Echo.channel("maps." + mapId).subscribed(() => {
            $bus.$emit(eventTypes.connected_to_websocket_channel, "maps." + mapId);
        });

        if (channel.value) {
            return channel.value;
        }
    }

    const leaveChannel = (mapId: string) => {
        if (channel.value) {
            window.Echo.leave("maps." + mapId);
        }
    }

    return {
        isLive,
        joinChannel,
        leaveChannel,
        channel
    }
}