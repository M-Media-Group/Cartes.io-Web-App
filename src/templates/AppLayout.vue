<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";
import AppFooter from "@/components/AppFooter.vue";

</script>
<template>
    <slot name="nav">
        <NavBar />
    </slot>
    <header v-if="$slots.header">
        <slot name="header"></slot>
    </header>
    <main class="container">
        <slot />
    </main>
    <footer class="container">
        <slot name="footer">
            <AppFooter />
        </slot>
    </footer>
</template>
<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>