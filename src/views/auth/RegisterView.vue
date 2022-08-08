<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { useUser } from "@/composables/user";
import { ref } from "vue";

const { userForm, formErrors, register, isLoading } = useUser();

const termsAndConditionsAccepted = ref(false);

</script>
<template>
    <AppLayout>
        <article>
            <div class="grid">
                <div>
                    <BaseHeading title="Register"
                        subtitle="Sign up to Cartes.io" />

                    <form @submit.prevent="register()"
                        :disabled="isLoading ? 'disabled' : null">
                        <input type="text"
                            name="username"
                            placeholder="Username"
                            aria-label="Username"
                            autocomplete="nickname"
                            required
                            autofocus
                            v-model="userForm.username">
                        <small v-if="formErrors.username">{{ formErrors.username.join(' ') }}</small>
                        <input type="email"
                            name="email"
                            placeholder="Email"
                            aria-label="Email"
                            autocomplete="email"
                            required
                            v-model="userForm.email">
                        <small v-if="formErrors.email">{{ formErrors.email.join(' ') }}</small>

                        <input type="password"
                            name="password"
                            placeholder="New password"
                            aria-label="New password"
                            autocomplete="current-password"
                            required
                            v-model="userForm.password">
                        <small v-if="formErrors.password">{{ formErrors.password.join(' ') }}</small>

                        <fieldset>
                            <label for="remember">
                                <input type="checkbox"
                                    role="switch"
                                    id="remember"
                                    name="remember"
                                    v-model="termsAndConditionsAccepted">
                                Accept <a href="https://cartes.io/terms-and-conditions"
                                    target="_blank">terms and conditions</a>
                            </label>
                        </fieldset>
                        <BaseButton type="submit"
                            :disabled="isLoading || !termsAndConditionsAccepted"
                            class="contrast">Register</BaseButton>
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