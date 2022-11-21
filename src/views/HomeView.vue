<script setup lang="ts">
import { useMap } from '@/composables/map';
import AppLayout from "@/templates/AppLayout.vue";
import { useUser } from '@/composables/user';
import CreateMapButton from '@/components/CreateMapButton.vue';
import { defineAsyncComponent, onMounted } from 'vue';

const { maps, getAllMaps } = useMap();
const { users, getUsers, user } = useUser();

const MapArticle = defineAsyncComponent(() =>
    import('@/components/MapArticle.vue')
)

onMounted(() => {
    getAllMaps();
    getUsers();
});

</script>
<template>
    <AppLayout>
        <template #header>
            <div class="header">
                <div class="container">
                    <BaseHeading title="Maps for everyone and everything"
                        subtitle="Create maps, add markers, and share anywhere without even having to sign up." />
                    <div class="grid">

                        <create-map-button text="Create a new map" />

                        <div>
                            <BaseButton class="secondary"
                                v-if="!user"
                                to="/register">Sign up, if you want
                            </BaseButton>
                            <BaseButton class="secondary"
                                v-else
                                to="/me">My account
                            </BaseButton>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <div class="grid column-4-1-grid">
            <div>

                <BaseSection title="Public maps"
                    subtitle="These maps are made by the community and shared with everyone."
                    v-if="maps.length > 0">

                    <MapArticle v-for="(map, i) in maps"
                        :key="map.uuid"
                        :map="map"
                        :showDescription="true"
                        :showMap="i < 4"
                        :showFooter="true" />

                    <div>Showing {{ maps.length }} out of thousands of public and private maps
                    </div>
                </BaseSection>

                <BaseSection title="Public profiles"
                    subtitle="These profiles are public on Cartes.io"
                    v-if="users && users?.length > 0">

                    <article v-for="user in users">
                        <BaseHeading as="h3"
                            :title='user.username' />
                        <p v-if="user.description">{{ user.description }}</p>
                        <BaseButton :to="`/users/${user.username}`">View profile</BaseButton>
                        <footer v-if="user.public_maps_count">
                            {{ user.public_maps_count }} public maps
                        </footer>
                    </article>

                </BaseSection>
            </div>
            <aside>
                <h4>Cartes.io.</h4>
                <p>Privacy-first maps.</p>
                <p>This is an open source project. Feel free to contribute to the development on <a
                        href="https://github.com/M-Media-Group/Cartes.io">GitHub</a></p>
                <p>
                    <router-link to="/register">Sign up</router-link> to Cartes.io to get more info, make
                    maps private, and get updates as the project grows.
                </p>

                <iframe src="https://github.com/sponsors/M-Media-Group/button"
                    title="Sponsor M-Media-Group"
                    height="35"
                    width="116"
                    style="border: 0;"></iframe>
            </aside>
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

@media (min-width: 992px) {
    .column-2-grid {
        grid-template-columns: 1fr 1fr;
    }

    .column-4-1-grid {
        grid-template-columns: 4fr 1fr;
    }
}

.scrollableGrid {
    grid-template-rows: 1fr 1fr;
    grid-auto-flow: column;
    overflow-y: scroll;
    width: 100%;
    grid-template-columns: unset;

    width: 99vw;
    margin-left: -4rem;
    align-items: flex-start;

    grid-auto-columns: 1fr;
}

.scrollableGrid>* {
    min-width: unset;
    align-items: flex-start;
}




.horizontal-media-scroller {
    --size: 150px;
    display: grid;
    grid-auto-columns: minmax(60vw, 280px);
    grid-auto-flow: column;
    grid-auto-flow: column;
    gap: calc(var(--grid-spacing-horizontal) / 2);
    margin: 0;
    padding-inline-end: var(--grid-spacing-horizontal);
    padding-block-start: calc(var(--grid-spacing-horizontal) / 2);
    padding-block-end: calc(var(--grid-spacing-horizontal) / 2);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline mandatory;
    scroll-padding-left: var(--grid-spacing-horizontal);
    scroll-padding-right: var(--grid-spacing-horizontal);
    scroll-padding-inline: var(--grid-spacing-horizontal);
}

@media (prefers-reduced-motion: no-preference) {
    .horizontal-media-scroller {
        scroll-behavior: smooth;
    }
}

.horizontal-media-scroller>li {
    display: inline-block;
    /*  container padding fix  */
}

.horizontal-media-scroller>li:last-of-type figure {
    position: relative;
}

.horizontal-media-scroller>li:last-of-type figure::after {
    content: "";
    position: absolute;
    inline-size: var(--grid-spacing-horizontal);
    block-size: 100%;
    inset-block-start: 0;
    inset-inline-end: calc(var(--grid-spacing-horizontal) * -1);
}

.horizontal-media-scroller figure {
    scroll-snap-align: start;
}

.horizontal-media-scroller a {
    display: inline-block;
    text-decoration: none;
    color: inherit;
    outline-offset: 12px;
}

.horizontal-media-scroller a:focus {
    outline-offset: 7px;
}

@media (prefers-reduced-motion: no-preference) {
    .horizontal-media-scroller a {
        transition: outline-offset 0.25s ease;
    }
}
</style>