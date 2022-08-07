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
            <li role="list"
                v-if="user?.id">
                <router-link :to='`/users/${user.username}`'
                    aria-haspopup="listbox">{{ user.username }}
                </router-link>
                <ul role="listbox">
                    <li>
                        <router-link :to='`/users/${user.username}`'
                            aria-haspopup="listbox">Profile
                        </router-link>
                    </li>
                    <li>
                        <router-link :to='`/me`'
                            aria-haspopup="listbox">Settings
                        </router-link>
                    </li>
                </ul>
            </li>

            <router-link v-else
                :aria-busy="isLoading"
                :disabled="isLoading ? 'disabled' : null"
                to='/login'>{{ isLoading ? '' : 'Login' }}
            </router-link>
            </li>
            <li>
                <BaseButton :aria-busy="Maps.isLoading.value"
                    :disabled="Maps.isLoading.value"
                    @click="Maps.addMap(null, true)">New map</BaseButton>
            </li>
        </ul>
    </nav>
</template>