<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { useUser } from "@/composables/user";
import { ref } from "vue";
import { useRouter } from "vue-router";
import $bus, { eventTypes } from "@/eventBus/events";

const { userForm, formErrors, register, isLoading } = useUser();

const router = useRouter();

const termsAndConditionsAccepted = ref(false);

$bus.$on(eventTypes.registered, async () => {
    router.push("/");
});

const generateUsernameFromEmail = () => {
    userForm.username = userForm.email.split("@")[0];
}

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

                        <BaseInput type="email"
                            label="Email"
                            autocomplete="email"
                            required
                            autofocus
                            v-model="userForm.email"
                            @blur="generateUsernameFromEmail()"
                            :showLabel="false"
                            :errors="formErrors.email"
                            helpText="Your email address is private and never visible to anyone" />

                        <BaseInput label="Username"
                            autocomplete="nickname"
                            required
                            v-model="userForm.username"
                            :showLabel="false"
                            :errors="formErrors.username" />

                        <BaseInput type="password"
                            label="New password"
                            autocomplete="password"
                            required
                            v-model="userForm.password"
                            :errors="formErrors.password"
                            :showLabel="false" />

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