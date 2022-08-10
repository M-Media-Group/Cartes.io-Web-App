<script setup lang="ts">
import { Map } from '@/types/map';
import { PropType } from 'vue';

defineProps({
    map: {
        type: Object as PropType<Map>,
        required: true,
    },
    showPreText: {
        type: Boolean,
        default: true
    }
})

</script>
<template>
    <template v-if="map.user">
        <template v-if="showPreText">
            Made by
        </template>
        <router-link :to="`/users/${map.user.username}`">
            {{ map.user.username }}
        </router-link>
    </template>
    <template v-else-if="map.is_linked_to_user">
        <template v-if="showPreText">
            Made by a
        </template>
        <span data-tooltip="This map was created by a private Cartes.io user">Cartes.io
            user</span>
    </template>
    <template v-else>
        <template v-if="showPreText">
            Made by an
        </template>
        <span data-tooltip="This map was created by someone not signed in">anonymous
            user</span>
    </template>
</template>