import { createApp } from 'vue'
import App from './App.vue'
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Event bus listeners
import "./eventBus/listeners/index";

const app = createApp(App)

app.config.globalProperties.window = window

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

app.mount('#app')