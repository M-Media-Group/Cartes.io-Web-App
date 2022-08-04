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
                        <h1>Sign in</h1>
                        {{ email }}
                        <h2>A minimalist layout for Login pages</h2>
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
                <div></div>
            </article>
        </div>
    </AppLayout>
</template>