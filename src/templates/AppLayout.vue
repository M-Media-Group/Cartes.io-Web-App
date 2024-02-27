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
            style="position:relative;"
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
    transition: opacity 0.1s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}

#app>footer,
article>footer {
    padding-block: var(--pico-block-spacing-vertical);
    padding-top: calc(var(--pico-block-spacing-vertical) * 2);
    padding-bottom: calc(var(--pico-block-spacing-vertical) * 2);
}
</style>