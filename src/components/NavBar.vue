<script setup lang="ts">
import { useMap } from '@/composables/map';
const Maps = useMap();
const url = import.meta.env.VITE_API_URL + "/login";
</script>

<template>
    <nav class="container-fluid">
        <ul>
            <li>
                <router-link to='/'>
                    <strong>Cartes.io</strong>
                </router-link>
            </li>
        </ul>
        <ul>
            <li><a :href="url">Login</a></li>
            <li>
                <button @click="Maps.addMap(null, true)">New map</button>
            </li>
        </ul>
    </nav>
</template>