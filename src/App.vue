<script setup lang="ts">
import { RouterView } from "vue-router";
import Navbar from "./components/Navbar.vue";
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <Navbar />
    </header>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.main-content {
  margin-top: 5rem;
  flex: 1;
  width: 100%;
  overflow-x: hidden;
}

@media (max-width: 960px) {
  .main-content {
    margin-top: 3.5rem;
  }
}
</style>
