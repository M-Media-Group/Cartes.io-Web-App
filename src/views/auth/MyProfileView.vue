<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { PersonalAccessToken } from "@/types/user";
import { useUser } from '@/composables/user';
import { ref } from "vue";
import $bus, { eventTypes } from "@/eventBus/events";

const { user, userForm, isLoading, getPersonalAccessTokens, logout, createPersonalAccessToken, updateUser } = useUser();

const accessTokens = ref<PersonalAccessToken[]>([]);
getPersonalAccessTokens().then(tokens => accessTokens.value = tokens);

const tokenName = ref("");

const isLoadingToken = ref(false);

$bus.$on(eventTypes.created_personal_access_token, (e: { accessToken: string, token: PersonalAccessToken }) => {
    accessTokens.value.push(e.token);
    alert(e.accessToken)
    isLoadingToken.value = false;
});

</script>
<template>
    <AppLayout>
        <div>
            <section>
                <div class="headings">
                    <h2>Your profile</h2>
                    <p></p>
                </div>

                <article :aria-busy="isLoading">
                    <template v-if="user">
                        <header>{{ user.username }}</header>
                        <form @submit.prevent="updateUser()">
                            <label for="username">Username
                                <input type="text"
                                    name="username"
                                    placeholder="Username"
                                    aria-label="Username"
                                    autocomplete="nickname"
                                    required
                                    autofocus
                                    v-model="userForm.username">
                                <small>Pick a unique name</small>
                            </label>
                            <label for="username">Email
                                <input type="text"
                                    name="username"
                                    placeholder="Username"
                                    aria-label="Username"
                                    autocomplete="nickname"
                                    required
                                    autofocus
                                    v-model="userForm.email">
                                <small>Your email address</small>
                            </label>
                            <fieldset>
                                <label for="remember">
                                    <input type="checkbox"
                                        role="switch"
                                        id="remember"
                                        name="remember"
                                        v-model="userForm.is_public">
                                    Public profile <router-link :to="`/users/${user.username}`"><small>View
                                            profile</small>
                                    </router-link>
                                </label>
                            </fieldset>
                            <label for="description">
                                <textarea name="description"
                                    placeholder="Description"
                                    aria-label="Description"
                                    v-model="userForm.description"></textarea>
                                <small>Describe yourself</small>
                            </label>
                            <BaseButton type="submit"
                                :disabled="isLoading">Update</BaseButton>
                        </form>
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
                    <footer>
                        <form @submit.prevent="isLoadingToken = true; createPersonalAccessToken(tokenName)"
                            class="grid"
                            :disabled="isLoadingToken ? 'disabled' : null">
                            <input type="text"
                                name="token"
                                placeholder="Token name"
                                aria-label="Token name"
                                required
                                v-model="tokenName">
                            <BaseButton type="submit"
                                :disabled="isLoadingToken">Create token</BaseButton>
                        </form>
                    </footer>
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