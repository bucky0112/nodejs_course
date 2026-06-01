<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['success', 'switch-to-register'])

const { login } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    await login(username.value, password.value)
    emit('success')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="form-container">
    <h2>登入</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">帳號</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="請輸入帳號"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">密碼</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="請輸入密碼"
          required
        />
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <button type="submit" :disabled="loading">
        {{ loading ? '登入中...' : '登入' }}
      </button>
    </form>

    <p class="switch-link">
      還沒有帳號？
      <a href="#" @click.prevent="emit('switch-to-register')">註冊</a>
    </p>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #42b883;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

button:hover:not(:disabled) {
  background: #3aa876;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  padding: 0.5rem;
  background: #fde8e8;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.switch-link {
  text-align: center;
  margin-top: 1rem;
}

.switch-link a {
  color: #42b883;
}
</style>
