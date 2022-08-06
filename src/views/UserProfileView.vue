
<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import MapArticle from "@/components/MapArticle.vue";
import { PropType, ref, watch } from "vue";

import { now } from "@/composables/time";
import { User } from "@/types/user";

const props = defineProps({
    user: {
        type: Object as PropType<User>,
        required: true,
    },
})

const accountAgeInDays = ref(0);

const accountAgeInText = ref("");

// Watch the user for changes
watch(() => props.user, () => {

    const createdAt = new Date(props.user.created_at);
    const diff = now.value - createdAt.getTime();

    accountAgeInDays.value = Math.round(diff / (1000 * 60 * 60 * 24));

    accountAgeInText.value = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
    }).format(-accountAgeInDays.value, "day");

}, { immediate: true })

</script>

<template>
    <AppLayout>
        <template #header>
            <div class="header">
                <div class="container">
                    <div class="headings">
                        <h1>{{ user.username }}</h1>
                        <p>Joined {{ accountAgeInText }}</p>
                    </div>
                </div>
            </div>
        </template>

        <div>

            <section>
                <div class="headings">
                    <h2>Maps</h2>
                    <p>All the public maps that {{ user.username }} has created</p>
                </div>
                <div v-if="user.public_maps">
                    <MapArticle v-for="map in user.public_maps"
                        :key="map.uuid"
                        :map="map" />
                </div>
                <template v-else>
                    <h3>{{ user.username }} has no public maps</h3>
                </template>
            </section>
        </div>
    </AppLayout>
</template>
<style scoped>
.header {
    min-height: 23rem;
    background-color: var(--background-color);
    /* background: linear-gradient(var(--card-border-color), var(--background-color)), url(/images/earth.jpg) no-repeat; */
    background-image: linear-gradient(0deg, var(--background-color) 0%, var(--card-border-color) 100%);
    background-size: cover;

    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>