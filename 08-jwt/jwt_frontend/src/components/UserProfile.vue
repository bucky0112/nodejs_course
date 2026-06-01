<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['logout'])

const { user, token, getProfile, logout } = useAuth()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    await getProfile()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function handleLogout() {
  logout()
  emit('logout')
}
</script>

<template>
  <div class="profile-container">
    <h2>個人資料</h2>

    <div v-if="loading" class="loading">載入中...</div>

    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="handleLogout" class="logout-btn">重新登入</button>
    </div>

    <div v-else class="profile-info">
      <div class="info-item">
        <span class="label">User ID:</span>
        <span class="value">{{ user?.userId }}</span>
      </div>
      <div class="info-item">
        <span class="label">帳號:</span>
        <span class="value">{{ user?.username }}</span>
      </div>

      <div class="token-section">
        <h3>JWT Token</h3>
        <div class="token-display">
          <code>{{ token }}</code>
        </div>
        <p class="token-note">Token 有效期 5 分鐘</p>
      </div>

      <button @click="handleLogout" class="logout-btn">登出</button>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.loading {
  text-align: center;
  color: #666;
}

.error {
  color: #e74c3c;
  padding: 1rem;
  background: #fde8e8;
  border-radius: 4px;
  text-align: center;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.label {
  font-weight: 600;
  min-width: 100px;
  color: #666;
}

.value {
  color: #333;
}

.token-section {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 4px;
}

.token-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #666;
}

.token-display {
  background: #2d2d2d;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.token-display code {
  color: #42b883;
  font-size: 0.75rem;
  word-break: break-all;
}

.token-note {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #888;
}

.logout-btn {
  padding: 0.75rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.logout-btn:hover {
  background: #c0392b;
}
</style>
