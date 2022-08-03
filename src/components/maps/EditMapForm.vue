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

const settings = reactive({
    title: {
        title: "Title",
        value: props.map.title,
    },
    description: {
        title: "Description",
        value: props.map.description,
    },
    privacy: {
        title: "Who can see this map",
        value: props.map.privacy,
        options: [
            {
                value: 'public',
                label: 'Everyone',
                description: 'Anyone can see this map',
                disabled: false,
            },
            {
                value: 'unlisted',
                label: 'Only people with the link',
                description: '',
                disabled: false,
            },
            {
                value: 'private',
                label: 'Private',
                description: '',
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
                description: '',
                disabled: false,
            },
            {
                value: 'only_logged_in',
                label: 'Only people that are logged in',
                description: '',
                disabled: false,
            },
            {
                value: 'no',
                label: 'No one',
                description: 'You can still create markers regardless of this setting',
                disabled: false,
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
                description: '',
                disabled: false,
            },
            {
                value: '180',
                label: '3 hours',
                description: '',
                disabled: false,
            },
            {
                value: '',
                label: 'Never',
                description: '',
                disabled: false,
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
                description: '',
                disabled: false,
            },
            {
                value: 'land',
                label: 'Land',
                description: 'Setting this to "water" or "land" will also drastically limit how many markers can be created on this map per minute',
                disabled: false,
            },
            {
                value: 'water',
                label: 'Water',
                description: 'Setting this to "water" or "land" will also drastically limit how many markers can be created on this map per minute',
                disabled: false,
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
                description: '',
                disabled: false,
            },
            {
                value: 'optional',
                label: 'Optional',
                description: '',
                disabled: false,
            },
            {
                value: '',
                label: 'Disabled',
                description: '',
                disabled: false,
            },
        ],
    },
})

const updateMapSettings = (mapId: string, settings: any) => {

    // Simplify each nested data object to just key: value
    const settingsToUpdateSimplified = Object.keys(settings).reduce((acc: any, key) => {
        const value = settings[key];
        if (typeof value === 'object') {
            acc[key] = value.value;
        } else {
            acc[key] = value;
        }
        return acc;
    }, {});

    // Convert any settings with keys that use dot notation into nested objects
    const settingsToUpdate = Object.keys(settingsToUpdateSimplified).reduce((acc: any, key) => {
        const value = settingsToUpdateSimplified[key];
        const parts = key.split('.');
        if (parts.length > 1) {
            const last = parts.pop() as string;
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
    <div>
        <form @submit.prevent="updateMapSettings(map.uuid, settings)">
            <div v-for="(setting, key) in settings"
                :key="key">
                <label>{{ setting.title }}
                    <template v-if="'options' in setting">
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
                                <small style="margin-top:0.5rem;"
                                    v-if="option.description">{{ option.description }}</small>
                            </label>
                        </template>
                    </template>
                    <template v-else>
                        <!-- Text input -->
                        <input type="text"
                            v-model="setting.value"
                            :placeholder="setting.title">
                    </template>
                </label>
            </div>
            <button type="submit">Save</button>
        </form>
        <button v-if="Maps.canDeleteMap(map)"
            @click="Maps.deleteMap(map)"
            class="contrast">Delete map</button>
    </div>
</template>