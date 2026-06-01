<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['success', 'switch-to-login'])

const { register } = useAuth()

const form = ref({
  username: '',
  password: '',
  email: '',
  age: '',
  phoneNumber: ''
})
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    const userData = {
      ...form.value,
      age: form.value.age ? Number(form.value.age) : undefined
    }
    await register(userData)
    alert('註冊成功！請登入')
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
    <h2>註冊</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">帳號 *</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          placeholder="3-20 個字元"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">密碼 *</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="至少 8 個字元"
          required
        />
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="example@mail.com"
          required
        />
      </div>

      <div class="form-group">
        <label for="age">年齡</label>
        <input
          id="age"
          v-model="form.age"
          type="number"
          placeholder="選填，至少 13 歲"
          min="13"
        />
      </div>

      <div class="form-group">
        <label for="phoneNumber">手機 *</label>
        <input
          id="phoneNumber"
          v-model="form.phoneNumber"
          type="text"
          placeholder="09XX-XXX-XXX"
          required
        />
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <button type="submit" :disabled="loading">
        {{ loading ? '註冊中...' : '註冊' }}
      </button>
    </form>

    <p class="switch-link">
      已有帳號？
      <a href="#" @click.prevent="emit('switch-to-login')">登入</a>
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
