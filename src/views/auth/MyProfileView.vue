<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { PersonalAccessToken } from "@/types/user";
import { useUser } from '@/composables/user';
import { ref } from "vue";

const { user, isLoading, getPersonalAccessTokens, logout } = useUser();

const accessTokens = ref<PersonalAccessToken[]>([]);
getPersonalAccessTokens().then(tokens => accessTokens.value = tokens);

</script>
<template>
    <AppLayout>
        <div class="container">
            <section>
                <div class="headings">
                    <h2>Your profile</h2>
                    <p></p>
                </div>

                <article :aria-busy="isLoading">
                    <template v-if="user">
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
                    </template>
                </article>
            </section>
            <section>
                <div class="headings">
                    <h2>Your API access tokens</h2>
                    <p></p>
                </div>

                <article :aria-busy="isLoading">
                    <template v-if="!isLoading && accessTokens.length > 0">
                        <ul>
                            <li v-for="token in accessTokens">
                                <strong>{{ token.name ?? "Untitled token" }}: </strong>
                                <span>created {{ token.created_at }}</span>
                            </li>
                        </ul>
                    </template>
                    <template v-else-if="!isLoading">
                        You have no API access tokens.
                    </template>
                </article>
            </section>
            <section>
                <div class="headings">
                    <h2>Log out</h2>
                    <p></p>
                </div>

                <article :aria-busy="isLoading">
                    <a v-if="user"
                        @click.prevent="logout()"
                        role="button"
                        href="#"
                        class="contrast">Log out</a>
                </article>
            </section>
        </div>
    </AppLayout>
</template>