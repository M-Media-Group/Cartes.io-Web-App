<script setup lang="ts">
import { PropType } from 'vue';

defineProps({
    label: {
        type: String,
        required: true,
    },
    showLabel: {
        type: Boolean,
        default: true,
    },
    errors: {
        type: Array as PropType<string[]>,
        required: false,
        default: [],
    },
    type: {
        type: String,
        required: false,
        default: 'text'
    },
    helpText: {
        type: String,
        required: false,
    },
    modelValue: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
}

</script>
<template>
    <component :is="showLabel ? 'label' : 'div'">
        {{ showLabel ? label : null }}
        <input :type="type"
            :name="label"
            :placeholder="label"
            :aria-label="label"
            required
            autofocus
            :value="modelValue"
            @input="handleInput($event)"
            :aria-invalid="errors.length > 0 ? true : undefined"
            v-bind="$attrs">
        <small v-if="errors.length > 0">{{ errors.join(' ') }}</small>
        <small v-else-if="helpText">{{ helpText }}</small>
    </component>
</template>