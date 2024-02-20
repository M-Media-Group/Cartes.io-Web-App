<script setup lang="ts">
import { useLiveMapTracking } from '@/composables/liveMapTracking';
import { usePusher } from '@/composables/pusher';
import { useUser } from '@/composables/user';
import userDevice from "@/classes/userDevice";
import { ref } from 'vue';
import $bus, { eventTypes } from "@/eventBus/events";

const user = useUser();
const { usernameToUse } = usePusher();
const { isSharingLocation } = useLiveMapTracking();

const isOpen = ref(false);

$bus.$on(eventTypes.enabled_location, () => {
    isOpen.value = true;
});

</script>

<template>
    <template>
        <ol-toggle-control v-if="userDevice.supportsGeolocation"
            html='<svg width="24px" height = "24px" viewBox = "-1.5 -1 24 24" xmlns = "http://www.w3.org/2000/svg" preserveAspectRatio = "xMinYMin" class="jam jam-gps" style = "padding: 4px;" > <path d="M18.913 2.9L2.632 9.226l4.829 2.006a5.767 5.767 0 0 1 3.118 3.119l2.006 4.828L18.913 2.9zm1.847.682l-6.328 16.281c-.4 1.03-1.551 1.557-2.571 1.18a1.923 1.923 0 0 1-1.11-1.067l-2.007-4.83a3.845 3.845 0 0 0-2.079-2.078l-4.828-2.006C.833 10.645.375 9.486.814 8.472A2.05 2.05 0 0 1 1.949 7.38L18.23 1.052a1.945 1.945 0 0 1 2.53 2.53z" > </path></svg >'
            :onToggle="user.toggleLocationTracking"
            :className="'ol-location-control ' + (user.locationWatcherId.value ? 'location-active' : '')" />

        <ol-overlay v-if="user.currentLocation.value && isOpen"
            :position="[user.currentLocation.value?.longitude, user.currentLocation.value?.latitude]"
            positioning="bottom-center"
            :offset="[0, -10]">
            <div class="overlay-content">

                <a href="#"
                    role="button"
                    @click.prevent="isOpen = false"
                    class="closeButton">&times;</a>

                <p>
                    <b>{{ usernameToUse }} (you)</b>
                    <small v-if="!isSharingLocation"> - Only you can see this</small>
                    <b v-else> - Everyone can see this</b>
                </p>
                <p>Accuracy: ± {{ user.currentLocation.value.accuracy.toFixed(2) }} meters</p>
                <p v-if="user.currentLocation.value.altitude">Altitude: {{
                    user.currentLocation.value.altitude.toFixed(2)
                }} meters</p>
                <p v-if="user.currentLocation.value.altitudeAccuracy">Altitude accuracy: ± {{
                    user.currentLocation.value.altitudeAccuracy.toFixed(2)
                }} meters</p>
                <p v-if="user.currentLocation.value.speed">Speed: {{ user.currentLocation.value.speed.toFixed(2) }}
                    kilometers per hour</p>
                <p v-if="user.currentLocation.value.heading">Heading: {{
                    user.currentLocation.value.heading.toFixed(2)
                }} degrees</p>
            </div>
        </ol-overlay>

        <ol-vector-layer title="User locations">
            <ol-source-vector>
                <ol-feature>
                    <ol-geom-circle :center="[user.currentLocation.value?.longitude, user.currentLocation.value?.latitude]"
                        :radius="0.001"></ol-geom-circle>
                    <ol-style>
                        <ol-style-stroke color="blue"
                            :width="2"></ol-style-stroke>
                        <ol-style-fill color="rgba(255,200,0,0.2)"></ol-style-fill>
                    </ol-style>
                </ol-feature>

            </ol-source-vector>
        </ol-vector-layer>
    </template>
</template>