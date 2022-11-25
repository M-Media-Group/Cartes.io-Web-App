<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { PersonalAccessToken } from "@/types/user";
import { useUser } from '@/composables/user';
import { ref } from "vue";
import $bus, { eventTypes } from "@/eventBus/events";
import { useRouter } from "vue-router";

const { user, userForm, isLoading, getPersonalAccessTokens, logout, createPersonalAccessToken, updateUser } = useUser();

const accessTokens = ref<PersonalAccessToken[]>([]);
getPersonalAccessTokens().then(tokens => accessTokens.value = tokens);

const router = useRouter();

const tokenName = ref("");

const isLoadingToken = ref(false);

$bus.$on(eventTypes.created_personal_access_token, (e: { accessToken: string, token: PersonalAccessToken }) => {
    accessTokens.value.push(e.token);
    alert(e.accessToken)
    isLoadingToken.value = false;
});

$bus.$on(eventTypes.logged_out, async () => {
    router.push("/login");
})

</script>
<template>
    <AppLayout>
        <div>
            <BaseSection title="Settings">
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
                                    :minlength="3"
                                    v-model="userForm.username">
                                <small>Pick a unique username for your profile</small>
                            </label>
                            <label for="username">Email
                                <input type="email"
                                    name="email"
                                    placeholder="Email"
                                    aria-label="Email"
                                    autocomplete="email"
                                    required
                                    autofocus
                                    v-model="userForm.email">
                                <small>Your email is never visible to anyone</small>
                            </label>
                            <fieldset>
                                <label for="is_public">
                                    <input type="checkbox"
                                        role="switch"
                                        id="is_public"
                                        name="is_public"
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
                                    :maxlength="191"
                                    v-model="userForm.description"></textarea>
                                <small>Your profile description is shown on your profile</small>
                            </label>
                            <BaseButton type="submit"
                                :disabled="isLoading">Update</BaseButton>
                        </form>
                    </template>
                </article>
            </BaseSection>

            <BaseSection title="Your API access tokens">
                <article :aria-busy="isLoading">
                    <template v-if="!isLoading && accessTokens.length > 0 && user?.email_verified_at">
                        <ul>
                            <li v-for="token in accessTokens">
                                <strong>{{ token.name ?? "Untitled token" }}: </strong>
                                <span>created {{ token.created_at }}</span>
                            </li>
                        </ul>
                    </template>
                    <template v-else-if="!user?.email_verified_at && !isLoading">
                        You need to verify your email address before you can create API access tokens.
                    </template>
                    <template v-else-if="!isLoading">
                        You have no API access tokens.
                    </template>
                    <footer v-if="user?.email_verified_at">
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
            </BaseSection>

            <BaseSection title="Your account permissions">
                <article :aria-busy="isLoading">
                    <template v-if="!user?.email_verified_at && !isLoading">
                        You need to verify your email address to be granted permissions.
                    </template>
                    <template v-else-if="!isLoading && user?.roles && user?.roles.length > 0">
                        <p>You've been granted the following permissions:</p>
                        <ul>
                            <template v-for="role in user?.roles"
                                :key="role.id">
                                <li v-for="permission in role.permissions"
                                    :key="permission.id">
                                    {{ permission.name }}
                                </li>
                            </template>
                        </ul>
                    </template>
                    <template v-else-if="!isLoading">There's no permissions associated with your account right
                        now.</template>
                    <footer>
                        To request further permissions, please contact us.
                    </footer>
                </article>
            </BaseSection>
            <BaseSection title="Log out">
                <article :aria-busy="isLoading">
                    <a v-if="user"
                        @click.prevent="logout()"
                        role="button"
                        href="#"
                        class="contrast">Log out</a>
                </article>
            </BaseSection>
        </div>
    </AppLayout>
</template>