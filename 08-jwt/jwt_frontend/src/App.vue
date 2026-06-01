<script setup>
import { ref } from 'vue'
import { useAuth } from './composables/useAuth'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'
import UserProfile from './components/UserProfile.vue'

const { isAuthenticated } = useAuth()

// 當前顯示的頁面: 'login' | 'register'
const currentView = ref('login')

function switchToRegister() {
  currentView.value = 'register'
}

function switchToLogin() {
  currentView.value = 'login'
}
</script>

<template>
  <div class="app">
    <header>
      <h1>JWT Demo</h1>
    </header>

    <main>
      <!-- 已登入：顯示個人資料 -->
      <UserProfile v-if="isAuthenticated" @logout="switchToLogin" />

      <!-- 未登入：顯示登入或註冊表單 -->
      <template v-else>
        <LoginForm
          v-if="currentView === 'login'"
          @success="() => {}"
          @switch-to-register="switchToRegister"
        />
        <RegisterForm
          v-else
          @success="switchToLogin"
          @switch-to-login="switchToLogin"
        />
      </template>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

header h1 {
  color: #42b883;
}

main {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
