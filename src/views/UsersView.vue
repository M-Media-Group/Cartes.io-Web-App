
<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { useUser } from "@/composables/user";

const { users, getUsers } = useUser();

getUsers();

</script>

<template>
    <AppLayout>
        <div>
            <section>
                <div class="headings">
                    <h2>Users</h2>
                    <p>All public users</p>
                </div>
                <article v-for="user in users">
                    <h3>{{ user.username }}</h3>
                    <p v-if="user.description">{{ user.description }}</p>
                    <router-link :to="`/users/${user.username}`"
                        custom
                        v-slot="{ navigate }">
                        <button @click="navigate">View profile</button>
                    </router-link>
                    <footer v-if="user.public_maps_count">
                        {{ user.public_maps_count }} public maps
                    </footer>
                </article>
            </section>
        </div>
    </AppLayout>
</template>
