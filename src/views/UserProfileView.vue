
<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import MapArticle from "@/components/MapArticle.vue";

defineProps({
    user: {
        type: Object,
        required: true,
    },
})

</script>

<template>
    <AppLayout>
        <template #header>
            <div class="header">
                <div class="container">
                    <div class="headings">
                        <h1>{{ user.username }}</h1>
                        <p>Joined 246 days ago</p>
                    </div>
                </div>
            </div>
        </template>

        <div>

            <section>
                <div class="headings">
                    <h2>Maps</h2>
                    <p>All the public maps that user has created</p>
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