import { inject, ref } from "vue";

export function usePusher() {
    const isLive = inject('isConnectedToPusher');
    return {
        isLive,
    }
}