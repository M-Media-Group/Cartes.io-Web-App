<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { useUser } from "@/composables/user";

const { email, password, username, register, isLoading } = useUser();

</script>
<template>
    <AppLayout>
        <article>
            <div class="grid">
                <div>
                    <div class="headings">
                        <h1>Register</h1>
                        <h2>Sign up to Cartes.io</h2>
                    </div>
                    <form @submit.prevent="register()"
                        :disabled="isLoading">
                        <input type="text"
                            name="username"
                            placeholder="Username"
                            aria-label="Username"
                            autocomplete="nickname"
                            required
                            v-model="username">
                        <input type="email"
                            name="email"
                            placeholder="Email"
                            aria-label="Email"
                            autocomplete="email"
                            required
                            v-model="email">
                        <input type="password"
                            name="password"
                            placeholder="Password"
                            aria-label="Password"
                            autocomplete="current-password"
                            required
                            v-model="password">
                        <fieldset>
                            <label for="remember">
                                <input type="checkbox"
                                    role="switch"
                                    id="remember"
                                    name="remember">
                                Accept terms and conditions
                            </label>
                        </fieldset>
                        <button type="submit"
                            :disabled="isLoading"
                            class="contrast">Register</button>
                    </form>
                </div>
                <img src="/images/earth.jpg" />
            </div>
            <footer>
                <router-link to="/login">Already have an account? Log in!</router-link>
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