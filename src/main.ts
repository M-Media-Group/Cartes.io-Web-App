import { createApp, ref } from 'vue'
import App from '@/App.vue'
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import router from '@/router';
import axios from 'axios';

// Event bus listeners
import "./eventBus/listeners/index";

const app = createApp(App)

app.config.globalProperties.window = window

axios.defaults.baseURL = 'https://cartes.io';

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

app.mount('#app')