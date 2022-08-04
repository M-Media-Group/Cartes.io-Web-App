<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";

import { useUser } from '@/composables/user.js';

const { user, isLoading } = useUser();
</script>
<template>
    <AppLayout>
        <div class="container"
            :aria-busy="isLoading">
            <article v-if="user">
                <header>{{ user.username }}</header>
                <!-- List of user attributes -->
                <ul>
                    <li>
                        <strong>Email: </strong>
                        <span>{{ user.email }}</span>
                    </li>
                    <li>
                        <strong>Created at: </strong>
                        <span>{{ user.created_at }}</span>
                    </li>
                    <li>
                        <strong>Updated at: </strong>
                        <span>{{ user.updated_at }}</span>
                    </li>
                </ul>
            </article>
        </div>
    </AppLayout>
</template>