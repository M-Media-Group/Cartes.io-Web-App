<script setup lang="ts">
import AppLayout from "@/templates/AppLayout.vue";
import { useUser } from "@/composables/user";
import { useRouter } from "vue-router";
import $bus, { eventTypes } from "@/eventBus/events";

const { userForm, sendPasswordReset, isLoading } = useUser();
const router = useRouter();

$bus.$on(eventTypes.sent_reset_password_email, () => {
    router.push("/login");
})
</script>
<template>
    <AppLayout>
        <article>
            <div class="grid">
                <div>
                    <BaseHeading title="Reset your password"
                        subtitle="Send yourself a password reset link" />
                    <form @submit.prevent="sendPasswordReset()"
                        :disabled="isLoading ? 'disabled' : null">
                        <input type="email"
                            name="email"
                            placeholder="Email"
                            aria-label="Email"
                            autocomplete="email"
                            required
                            autofocus
                            v-model="userForm.email">
                        <BaseButton type="submit"
                            :disabled="isLoading"
                            class="contrast">Send password reset link</BaseButton>
                    </form>
                </div>
                <img src="/images/earth.jpg" />
            </div>
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