
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
}

body>header {
  padding: 0;
}

summary {
  position: relative;
}

.blink {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 15px;
  height: 15px;
}

.blink:before {
  content: "";
  position: relative;
  display: block;
  width: 300%;
  height: 300%;
  box-sizing: border-box;
  margin-left: -100%;
  margin-top: -100%;
  border-radius: 45px;
  background-color: red;
  -webkit-animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.blink:after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  width: 100%;
  height: 100%;
  background-color: red;
  border-radius: 15px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  -webkit-animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
  animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
}

@-webkit-keyframes pulse-ring {
  0% {
    transform: scale(0.33);
  }

  80%,
  100% {
    opacity: 0;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.33);
  }

  80%,
  100% {
    opacity: 0;
  }
}

@-webkit-keyframes pulse-dot {
  0% {
    transform: scale(0.8);
  }

  50% {
    transform: scale(1);
  }

  100% {
    transform: scale(0.8);
  }
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.8);
  }

  50% {
    transform: scale(1);
  }

  100% {
    transform: scale(0.8);
  }
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