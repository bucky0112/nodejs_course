<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header>
      <h1>Realtime Chat</h1>
      <p class="subtitle">Supabase Realtime Demo</p>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  text-align: center;
  margin-bottom: 20px;
}

h1 {
  color: #3ecf8e;
  margin-bottom: 5px;
}

.subtitle {
  color: #888;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
