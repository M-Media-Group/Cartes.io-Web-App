<script setup lang="ts">
import { Map } from "@/types/map";
import { PropType } from "vue";

defineProps({
    map: {
        type: Object as PropType<Map>,
        required: true,
    },
})
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
            <li>Use the API to get the map and markers
                <!-- Code block showing API call -->
                <pre><code>GET https://cartes.io/api/maps/{{ map.uuid }}
GET https://cartes.io/api/maps/{{ map.uuid }}/markers</code></pre>
            </li>
            <li>Embed as iFrame
                <!-- Code block showing API call -->
                <pre><code>&lt;iframe src="https://cartes.io/embeds/maps/{{ map.uuid }}?type=map"
  width="100%"
  height="400"
  frameborder="0"&gt;&lt;/iframe&gt;</code></pre>
            </li>
            <li>Shortcode using our WordPress plugin
                <!-- Code block showing API call -->
                <pre><code>[cartes_map uuid="{{ map.uuid }}"]</code></pre>
            </li>
            <li>Python using our Python package
                <!-- Code block showing API call -->
                <pre><code>cartes.Maps('{{ map.uuid }}').get()</code></pre>
            </li>
            <li>JS using our NPM package
                <!-- Code block showing API call -->
                <pre><code>cartes.maps('{{ map.uuid }}').get()</code></pre>
            </li>
        </ul>
        <p>When using the API or embedding the map, you must attribute this website on your front-end.</p>
    </div>
</template>