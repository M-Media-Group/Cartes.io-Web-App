import { createApp, ref } from 'vue'
import App from '@/App.vue'
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import router from '@/router';
import axios from 'axios';
import VueGtag from "vue-gtag";
import cartes from "@m-media/npm-cartes-io";
import { Vue3ProgressPlugin, ProgressFinisher, useProgress } from '@marcoschulte/vue3-progress';
import VueHotjar from 'vue-hotjar-next'
import BaseButton from '@/components/BaseButton.vue'
import BaseHeading from '@/components/BaseHeading.vue'
import BaseSection from '@/components/BaseSection.vue'
import BaseInput from '@/components/BaseInput.vue'
import { registerSW } from 'virtual:pwa-register'
import { metaTagPlugin } from '@m-media/vue3-meta-tags';

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('New content is available. Please refresh.')) {
            updateSW()
        }
    },
    onOfflineReady() { },
})


import "@picocss/pico";

const progresses = [] as ProgressFinisher[];

axios.interceptors.request.use(config => {
    progresses.push(useProgress().start());
    return config;
});

axios.interceptors.response.use(resp => {
    progresses.pop()?.finish();
    return resp;
}, (error) => {
    progresses.pop()?.finish();
    return Promise.reject(error);
});

// Event bus listeners
import "./eventBus/listeners/index";

const app = createApp(App)

app.config.globalProperties.window = window

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
cartes.setBaseUrl(import.meta.env.VITE_API_URL + '/api/');

axios.defaults.withCredentials = true;

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_KEY,
    wsHost: import.meta.env.VITE_PUSHER_HOST ?? import.meta.env.VITE_API_URL,
    wsPort: import.meta.env.VITE_PUSHER_PORT ?? 6001,
    wssPort: import.meta.env.VITE_PUSHER_PORT ?? 6001,
    forceTLS: false,
    encrypted: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
});

const isConnectedToPusher = ref(false);

window.Echo.connector.pusher.connection.bind("connected", () => {
    isConnectedToPusher.value = true;
});

window.Echo.connector.pusher.connection.bind("disconnected", () => {
    isConnectedToPusher.value = false;
});

app.provide('isConnectedToPusher', isConnectedToPusher)

app.use(router);

app.use(VueGtag, {
    enabled: import.meta.env.PROD,
    bootstrap: import.meta.env.PROD,
    appName: 'Cartes.io',
    config: { id: import.meta.env.VITE_GA_MEASUREMENT_ID },
    pageTrackerEnabled: false,
}, router);

app.use(VueHotjar, {
    id: parseFloat(import.meta.env.VITE_HOTJAR_ID) ?? 1,
    isProduction: import.meta.env.VITE_HOTJAR_ID && import.meta.env.PROD,
    snippetVersion: 6
});

app.use(Vue3ProgressPlugin)

app.use(metaTagPlugin,
    {
        defaultName: import.meta.env.VITE_APP_NAME ?? 'Cartes.io',
        preconnect: [
            import.meta.env.VITE_API_URL,
        ],
    }, router);

app.component('BaseButton', BaseButton);
app.component('BaseHeading', BaseHeading);
app.component('BaseSection', BaseSection);
app.component('BaseInput', BaseInput);

app.mount('#app')