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
    cluster: 'eu',
    forceTLS: true
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

app.component('BaseButton', BaseButton);
app.component('BaseHeading', BaseHeading);

app.mount('#app')