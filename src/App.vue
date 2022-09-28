
<script setup lang="ts">
import { RouterView } from 'vue-router';

// Probably better to move it, views like EmbedView dont need this
import { useUser } from '@/composables/user';
import ProgressBar from './components/ProgressBar.vue';
const { getUser } = useUser();
getUser();

</script>

<template>
  <progress-bar />

  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-display: swap;
}

body>header {
  padding: 0;
}

summary {
  position: relative;
}

.alert {
  z-index: 1000;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--primary-hover);
  color: var(--primary-inverse);
  padding: var(--nav-element-spacing-vertical) var(--nav-element-spacing-horizontal);
}
</style>