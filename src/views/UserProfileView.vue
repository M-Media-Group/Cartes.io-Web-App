
<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import MapArticle from "@/components/MapArticle.vue";
import { PropType, ref, watch } from "vue";

import { now } from "@/composables/time";
import { User } from "@/types/user";
import { useUser } from "@/composables/user";

import $bus, { eventTypes } from "@/eventBus/events";

const props = defineProps({
    user: {
        type: Object as PropType<User>,
        required: true,
    },
    // Currently unused
    username: {
        type: null,
        required: false,
    },
})

const accountAgeInDays = ref(0);

const accountAgeInText = ref("");

const userInstance = useUser();

// Watch the user for changes
watch(() => props.user, () => {

    const createdAt = new Date(props.user.created_at);
    const diff = now.value - createdAt.getTime();

    accountAgeInDays.value = Math.round(diff / (1000 * 60 * 60 * 24));

    accountAgeInText.value = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
    }).format(-accountAgeInDays.value, "day");

}, { immediate: true })

const share = async () => {
    // Current url
    const url = window.location.href;
    // Trigger the Share Web API, or copy to clipboard if not supported
    navigator.share;
    if (navigator.share) {
        await navigator.share({
            title: props.user.username + " - Cartes.io",
            text: `Check out this profile on Cartes.io! ${url}`,
            url: url,
        }).then(() => {
            $bus.$emit(eventTypes.shared_profile, { user: props.user, action: "navigator.share" });
        }).catch(() => {
            // Just need an empty catch to avoid the error
        });
    } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(url);
        $bus.$emit(eventTypes.shared_profile, { user: props.user, action: "navigator.clipboard" });
        alert("Profile link copied to clipboard!");
    }
}

</script>

<template>
    <AppLayout>
        <template #header>
            <div class="header">
                <div class="container">
                    <div class="grid">
                        <img height="96"
                            width="96"
                            :src="user.avatar ?? 'https://via.placeholder.com/96'"
                            :alt="user.avatar + ' avatar on Cartes.io'" />
                        <div class="headings">
                            <h1>{{ user.username }}</h1>
                            <p>Joined {{ accountAgeInText }}</p>
                        </div>
                    </div>
                    <p v-if="user.description">{{ user.description }}</p>
                    <h2 v-if="userInstance.user.value?.username === user.username && user.is_public === false">
                        Only you can see this page because your profile is set to private.
                    </h2>
                    <div class="grid">
                        <button v-if="user.is_public === true"
                            @click="share()">Share profile</button>
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

            <section>
                <div class="headings">
                    <h2>Maps contributed to</h2>
                    <p>All the public maps that {{ user.username }} has created markers on</p>
                </div>
                <div v-if="user.public_maps_contributed_to">
                    <MapArticle v-for="map in user.public_maps_contributed_to"
                        :key="map.uuid"
                        :map="map"
                        :showMap="false" />
                </div>
                <template v-else>
                    <h3>{{ user.username }} has no public map contributions to show right now</h3>
                </template>
            </section>
        </div>
    </AppLayout>
</template>
<style scoped>
img {
    height: 96px;
    width: 96px;
    border-radius: 50%;
    background-color: var(--primary);
}

.grid {
    grid-template-columns: auto 1fr;
    margin-bottom: var(--spacing);
}

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