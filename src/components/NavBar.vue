<script setup lang="ts">
import { useMap } from '@/composables/map.js';
const Maps = useMap();
</script>
<template>
    <nav class="container-fluid">
        <ul>
            <li><a href="/"><strong>Cartes.io</strong></a></li>
        </ul>
        <ul>
            <li><a href="https://cartes.io/login">Login</a></li>
            <li>
                <button @click="Maps.addMap(null, true)">Create new map</button>
            </li>
        </ul>
    </nav>
</template>