<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { useUser } from "@/composables/user";
import { useRouter } from "vue-router";
import $bus, { eventTypes } from "@/eventBus/events";

const { userForm, login, isLoading, formErrors } = useUser();
const router = useRouter();

$bus.$on(eventTypes.logged_in, () => {
    router.push("/");
})
</script>
<template>
    <AppLayout>
        <article>
            <div class="grid">
                <div>
                    <BaseHeading title="Login"
                        subtitle="Login to Cartes.io" />
                    <form @submit.prevent="login()"
                        :disabled="isLoading ? 'disabled' : null">

                        <BaseInput type="email"
                            label="Email"
                            autocomplete="email"
                            required
                            autofocus
                            v-model="userForm.email"
                            :showLabel="false"
                            :errors="formErrors.email" />

                        <BaseInput type="password"
                            label="Password"
                            autocomplete="current-password"
                            required
                            v-model="userForm.password"
                            :errors="formErrors.password"
                            :showLabel="false" />

                        <fieldset>
                            <label for="remember">
                                <input type="checkbox"
                                    role="switch"
                                    id="remember"
                                    name="remember">
                                Remember me
                            </label>
                        </fieldset>
                        <BaseButton type="submit"
                            :disabled="isLoading"
                            class="contrast">Login</BaseButton>
                        <router-link to="/forgot-password">Forgot your password?</router-link>
                    </form>
                </div>
                <img src="/images/earth.jpg" />
            </div>
            <footer>
                <router-link to="/register">Don't have an account? Sign up!</router-link>
            </footer>
        </article>
    </AppLayout>
</template>
<style scoped>
img {
    display: none;
}

@media (min-width: 992px) {
    img {
        display: block;
        margin-top: calc(var(--block-spacing-vertical) * -1);
        margin-bottom: calc(var(--block-spacing-vertical) * -1);
        margin-left: calc(var(--block-spacing-vertical) * 1);
        /* margin: calc(var(--block-spacing-vertical) * -1) calc(var(--block-spacing-horizontal)); */
        height: calc(var(--block-spacing-vertical) * 2 + 100%);
        width: 100%;
        object-fit: cover;
    }
}
</style>