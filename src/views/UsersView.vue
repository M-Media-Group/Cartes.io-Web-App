
<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { useUser } from "@/composables/user";

const { users, getUsers } = useUser();

getUsers();

</script>

<template>
    <AppLayout>
        <div>
            <BaseSection title="Users"
                :subtitle="`All public users`">
                <article v-for="user in users">
                    <BaseHeading as="h3"
                        :title='user.username' />
                    <p v-if="user.description">{{ user.description }}</p>
                    <BaseButton :to="`/users/${user.username}`">View profile
                    </BaseButton>
                    <footer v-if="user.public_maps_count">
                        {{ user.public_maps_count }} public maps
                    </footer>
                </article>
            </BaseSection>
        </div>
    </AppLayout>
</template>
