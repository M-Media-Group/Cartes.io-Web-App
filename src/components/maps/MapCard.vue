<script setup lang="ts">
import { Category as CategoryType } from '@/types/category';
import { PropType } from 'vue';

defineProps({
    //   Define the props as from the marker.ts declaration
    category: {
        type: Object as PropType<CategoryType>,
        required: true,
    },
    description: {
        type: String as PropType<string | number | null>,
        required: false,
    },
    link: {
        type: String as PropType<string | number | null>,
        required: false,
    },
    elevation: {
        type: Number as PropType<number | string | null>,
        required: false,
    },
    created_at: {
        type: String as PropType<string | Date>,
        required: true,
    },
    updated_at: {
        type: String as PropType<string | Date>,
        required: true,
    },
    id: {
        type: Number,
        required: true,
    },
})
</script>

<template>
    <div>
        <h3>{{ category.name }}</h3>
        <p v-if="description">{{ description }}</p>
        <time>{{ created_at }}</time>
    </div>
</template>