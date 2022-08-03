<script setup lang="ts">
import { Marker } from '@/types/marker';
import { PropType } from 'vue';
import MapCard from './MapCard.vue';

defineProps({
    markers: {
        type: Array as PropType<Marker[]>,
        required: true,
    },
})
</script>

<template>
    <div>
        <!-- <MapCard v-for="marker in markers"
            :key="marker.id"
            :description="marker.description"
            :created_at="marker.created_at"
            :updated_at="marker.updated_at"
            :id="marker.id"
            :category="marker.category"
            :link="marker.link"
            :elevation="marker.elevation" /> -->
    </div>
</template>