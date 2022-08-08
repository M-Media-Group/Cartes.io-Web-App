<script setup lang="ts">
import { useMap } from "@/composables/map.js";
import { Map } from "@/types/map";
import { PropType } from "vue";

const { getMapToken } = useMap();

defineProps({
    map: {
        type: Object as PropType<Map>,
        required: true,
    },
})

const url = import.meta.env.VITE_API_URL;

</script>

<template>
    <div>
        <p>
            Use standard API requests to interact with this map. No
            authentication required for public and unlisted maps.
            <a href="https://github.com/M-Media-Group/Cartes.io/wiki/API"
                rel="noopener"
                target="_BLANK">Read the docs</a>.
        </p>
        <ul>
            <li>Use <a href="https://github.com/M-Media-Group/Cartes.io/wiki/API"
                    rel="noopener"
                    target="_BLANK">the API</a> to get this map and its markers
                <!-- Code block showing API call -->
                <pre><code>GET {{ url }}/api/maps/{{ map.uuid }}
GET {{ url }}/api/maps/{{ map.uuid }}/markers</code></pre>
            </li>
            <li>Embed as iFrame
                <!-- Code block showing API call -->
                <pre><code>&lt;iframe src="https://app.cartes.io/maps/{{ map.uuid }}/embed?type=map"
  width="100%"
  height="400"
  frameborder="0"&gt;&lt;/iframe&gt;</code></pre>
            </li>
            <li>Shortcode using our <a target="_BLANK"
                    href="https://wordpress.org/plugins/cartes/">WordPress plugin</a>
                <!-- Code block showing API call -->
                <pre><code>[cartes_map uuid="{{ map.uuid }}"]</code></pre>
            </li>
            <li>Python using our <a target="_BLANK"
                    href="https://pypi.org/project/py-cartes-io/">Python package</a>
                <!-- Code block showing API call -->
                <pre><code>cartes.Maps('{{ map.uuid }}', '{{ getMapToken(map) ?? 'optional_map_token' }}').get()</code></pre>
            </li>
            <li>JS using our <a target="_BLANK"
                    href="https://www.npmjs.com/package/@m-media/npm-cartes-io/">NPM package</a>
                <!-- Code block showing API call -->
                <pre><code>cartes.maps('{{ map.uuid }}', '{{ getMapToken(map) ?? 'optional_map_token' }}').get()</code></pre>
            </li>
        </ul>
        <p>When using the API or embedding the map, you must attribute this website on your front-end.</p>
    </div>
</template>