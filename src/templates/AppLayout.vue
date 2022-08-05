<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";
import AppFooter from "@/components/AppFooter.vue";

</script>
<template>
    <slot name="nav">
        <NavBar />
    </slot>
    <Transition appear>
        <header key="header"
            v-if="$slots.header">

            <slot name="header"></slot>

        </header>
    </Transition>
    <main key="main"
        class="container">
        <Transition appear>

            <slot />
        </Transition>
    </main>


    <footer key="footer"
        class="container">
        <slot name="footer">
            <AppFooter />
        </slot>
    </footer>
</template>
<style>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
    transition: opacity 0.15s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>