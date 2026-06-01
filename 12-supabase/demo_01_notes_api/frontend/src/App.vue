<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header>
      <h1>Notes API Demo</h1>
      <p class="subtitle">Supabase + Drizzle ORM</p>
      <nav>
        <RouterLink to="/notes">筆記</RouterLink>
        <RouterLink to="/users">使用者</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  color: #3ecf8e;
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

nav {
  display: flex;
  gap: 20px;
  justify-content: center;
}

nav a {
  color: #333;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #ddd;
  transition: all 0.2s;
}

nav a:hover,
nav a.router-link-active {
  background: #3ecf8e;
  color: #fff;
  border-color: #3ecf8e;
}

main {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
