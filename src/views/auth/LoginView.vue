<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { useUser } from "@/composables/user";

const { email, password, login } = useUser();

</script>
<template>
    <AppLayout>
        <div class="container">
            <article class="grid">
                <div>
                    <div class="headings">
                        <h1>Login</h1>
                        {{ email }}
                        <h2>Login to Cartes.io</h2>
                    </div>
                    <form @submit.prevent="login()">
                        <input type="text"
                            name="login"
                            placeholder="Login"
                            aria-label="Login"
                            autocomplete="nickname"
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
                                Remember me
                            </label>
                        </fieldset>
                        <button type="submit"
                            class="contrast">Login</button>
                    </form>
                </div>
                <img src="/images/earth.jpg" />
            </article>
        </div>
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