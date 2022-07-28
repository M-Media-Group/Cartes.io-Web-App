<script setup lang="ts">
import { useMap } from '@/composables/map';
import { Map } from '@/types/map';
import { Marker } from '@/types/marker';
import { PropType, reactive, watch } from 'vue';

const props = defineProps({
    map: {
        type: Object as PropType<Map>,
        required: true,
    },
})

const Maps = useMap();

console.log(props.map.privacy);

const settings = reactive({
    privacy: {
        title: "Who can see this map",
        value: props.map.privacy,
        options: [
            {
                value: 'public',
                label: 'Everyone',
                description: 'Anyone can see this map',
            },
            {
                value: 'unlisted',
                label: 'Only people with the link',
            },
            {
                value: 'private',
                label: 'Private',
                disabled: true,
            },
        ],
    },
    users_can_create_markers: {
        title: "Who can create markers",
        value: props.map.users_can_create_markers,
        options: [
            {
                value: 'yes',
                label: 'Everyone',
            },
            {
                value: 'only_logged_in',
                label: 'Only people that are logged in',
            },
            {
                value: 'no',
                label: 'No one',
                description: 'You can still create markers regardless of this setting',
            },
        ],
    },
    'options.default_expiration_time': {
        title: "Default expiration time",
        value: props.map.options?.default_expiration_time ?? '',
        options: [
            {
                value: '4320',
                label: '3 days',
            },
            {
                value: '180',
                label: '3 hours',
            },
            {
                value: '',
                label: 'Never',
            },
        ],
    },
    'options.limit_to_geographical_body_type': {
        title: "Limit to geographical body type",
        value: props.map.options?.limit_to_geographical_body_type ?? '',
        options: [
            {
                value: '',
                label: 'Anywhere',
            },
            {
                value: 'land',
                label: 'Land',
                description: 'Setting this to "water" or "land" will also drastically limit how many markers can be created on this map per minute'
            },
            {
                value: 'water',
                label: 'Water',
                description: 'Setting this to "water" or "land" will also drastically limit how many markers can be created on this map per minute'
            },
        ],

    },
    'options.links': {
        title: "Are links allowed",
        value: props.map.options?.links ?? '',
        options: [
            {
                value: 'required',
                label: 'Required',
            },
            {
                value: 'optional',
                label: 'Optional',
            },
            {
                value: '',
                label: 'Disabled',
            },
        ],
    },
})

const updateMapSettings = (mapId: string, settings: any) => {

    // Simplify each nested data object to just key: value
    const settingsToUpdateSimplified = Object.keys(settings).reduce((acc, key) => {
        const value = settings[key];
        if (typeof value === 'object') {
            acc[key] = value.value;
        } else {
            acc[key] = value;
        }
        return acc;
    }, {});

    // Convert any settings with keys that use dot notation into nested objects
    const settingsToUpdate = Object.keys(settingsToUpdateSimplified).reduce((acc, key) => {
        const value = settingsToUpdateSimplified[key];
        const parts = key.split('.');
        if (parts.length > 1) {
            const last = parts.pop();
            const obj = parts.reduce((acc, part) => acc[part] || (acc[part] = {}), acc);
            obj[last] = value;
        } else {
            acc[key] = value;
        }
        return acc;
    }, {});


    Maps.updateMap(props.map, settingsToUpdate);
}
</script>

<template>
    <form @submit.prevent="updateMapSettings(map.uuid, settings)">
        <div v-for="(setting, key) in settings"
            :key="key">
            <h2>{{ setting.title }}</h2>
            <!-- Radio box with setting options -->
            <template v-for="(option, index) in setting.options"
                :key="option.value">
                <label>
                    <input type="radio"
                        v-model="setting.value"
                        :value="option.value"
                        :disabled="option.disabled"
                        :key="index">
                    {{ option.label }}
                    <small v-if="option.description">{{ option.description }}</small>
                </label>
            </template>
        </div>
        <button type="submit">Go</button>
    </form>
</template>