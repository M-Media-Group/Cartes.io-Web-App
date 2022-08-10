
<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import MapArticle from "@/components/MapArticle.vue";
import { PropType, Ref, ref, watch } from "vue";

import { now } from "@/composables/time";
import { User } from "@/types/user";
import { useUser } from "@/composables/user";

import $bus, { eventTypes } from "@/eventBus/events";
import { Map } from "@/types/map";
import axios from "axios";
import CreateMapButton from '@/components/CreateMapButton.vue';

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

const privateMaps = ref([]) as Ref<Map[]>;

var ids = [] as string[];
Object.keys(localStorage).forEach(function (key) {
    if (key.includes("map_")) {
        ids.push(key.replace("map_", ""));
    }
});

const getMyMaps = () => {
    axios
        .get("/api/maps", {
            params: {
                ids: ids ?? [],
                orderBy: "updated_at",
                withMine: userInstance.user.value ? 1 : 0,
                query: "privacy!=public",
                with: ['markers']
            },
        })
        .then((response: { data: { data: Map[]; }; }) => {
            privateMaps.value = response.data.data;
        });
}

if (ids.length > 0 || userInstance.user.value?.id) {
    getMyMaps();
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
                            :alt="user.username + ' avatar on Cartes.io'" />
                        <div class="headings">
                            <h1>{{ user.username }}</h1>
                            <p>Joined {{ accountAgeInText }}
                                <template v-if="userInstance.user.value?.username === user.username">
                                    · <router-link to="/me">Edit</router-link>
                                </template>
                            </p>
                        </div>
                    </div>
                    <p v-if="user.description">{{ user.description }}</p>

                    <BaseHeading v-if="userInstance.user.value?.username === user.username && user.is_public === false"
                        as="h2"
                        title='Only you can see this page because your profile is set to private.' />

                    <div class="grid"
                        v-if="user.is_public !== false">
                        <BaseButton @click="share()">Share profile</BaseButton>
                    </div>
                </div>
            </div>
        </template>

        <div>
            <BaseSection v-if="userInstance.user.value?.username === user.username"
                title="Your private and unlisted maps"
                subtitle="These are the private, unlisted, or anonymous maps that you've created on the site. Only you can see this section.">

                <MapArticle v-for="map in privateMaps"
                    :key="map.uuid"
                    :map="map" />

                <article v-if="privateMaps.length === 0">
                    <BaseHeading as="h3"
                        title="You have no maps yet."
                        subtitle="Create your first map or browse the public ones." />
                    <create-map-button text="Create a new map" />
                </article>
            </BaseSection>

            <BaseSection title="Public maps"
                :subtitle="`All the public maps that ${user.username} has created`">

                <div v-if="user.public_maps && user.public_maps.length > 0">
                    <MapArticle v-for="map in user.public_maps"
                        :key="map.uuid"
                        :map="map" />
                </div>
                <template v-else>
                    <BaseHeading as="h3"
                        :title='user.username + " has no public maps to show right now"' />
                </template>
            </BaseSection>

            <BaseSection title="Public contributions"
                :subtitle="`All the public maps that ${user.username} has created markers on`">

                <div v-if="user.public_maps_contributed_to && user.public_maps_contributed_to.length > 0">
                    <MapArticle v-for="map in user.public_maps_contributed_to"
                        :key="map.uuid"
                        :map="map"
                        :showMap="false" />
                </div>
                <template v-else>
                    <BaseHeading as="h3"
                        :title='user.username + " has no public map contributions to show right now"' />
                </template>
            </BaseSection>
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