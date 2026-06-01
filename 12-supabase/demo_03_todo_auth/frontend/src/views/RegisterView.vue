<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '密碼不一致'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = '密碼至少需要 6 個字元'
    return
  }

  try {
    await authStore.register(email.value, password.value)
    router.push('/todos')
  } catch (err) {
    errorMessage.value = err
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>註冊</h1>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="至少 6 個字元"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">確認密碼</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="再次輸入密碼"
            required
          />
        </div>

        <div v-if="errorMessage" class="error">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? '註冊中...' : '註冊' }}
        </button>
      </form>

      <p class="switch-auth">
        已經有帳號？
        <router-link to="/login">登入</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0 0 30px;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #3ecf8e;
}

.error {
  background: #fee;
  color: #c00;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 12px;
  background: #3ecf8e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #38b27e;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-auth {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

.switch-auth a {
  color: #3ecf8e;
  text-decoration: none;
}

.switch-auth a:hover {
  text-decoration: underline;
}
</style>
