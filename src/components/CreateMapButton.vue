<script setup lang="ts">
import { useMap } from '@/composables/map';
import { useRouter } from 'vue-router';

const props = defineProps({
    redirect: {
        type: Boolean,
        default: true,
    },
    text: {
        type: String,
        default: "New map"
    }
});

const Maps = useMap();

const router = useRouter();

const createAndRedirect = async () => {
    const newMap = await Maps.addMap(null);
    if (props.redirect && newMap) {
        router.push('/maps/' + newMap.uuid);
    }
}
</script>
<template>
    <BaseButton :aria-busy="Maps.isLoading.value"
        :disabled="Maps.isLoading.value"
        @click="createAndRedirect()">{{ text }}</BaseButton>
</template>