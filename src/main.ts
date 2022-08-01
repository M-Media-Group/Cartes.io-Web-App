import { createApp } from 'vue'
import App from './App.vue'
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const app = createApp(App)

app.config.globalProperties.window = window

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_KEY,
    cluster: 'eu',
    forceTLS: true
});

app.mount('#app')