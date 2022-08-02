
import { ref } from 'vue'

export const now = ref(Date.now());

setInterval(function () {
    now.value = Date.now();
}, 1000)
