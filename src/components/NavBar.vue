<script setup lang="ts">
import { useMap } from '@/composables/map';

import { useUser } from '@/composables/user';

const Maps = useMap();

const { user, isLoading } = useUser();
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
            <li>
                <router-link v-if="user?.id"
                    to='/me'>{{ user.username }}
                </router-link>
                <router-link v-else
                    :aria-busy="isLoading"
                    :disabled="isLoading ? 'disabled' : null"
                    to='/login'>{{ isLoading ? '' : 'Login' }}
                </router-link>
            </li>
            <li>
                <button :aria-busy="Maps.isLoading.value"
                    :disabled="Maps.isLoading.value"
                    @click="Maps.addMap(null, true)">New map</button>
            </li>
        </ul>
    </nav>
</template>