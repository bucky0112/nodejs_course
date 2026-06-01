import { ref, computed } from 'vue'

// 使用相對路徑，透過 Vite proxy 轉發到後端
const API_BASE = ''

// 全域狀態 - 在 composable 外部定義以保持跨組件共享
const token = ref(localStorage.getItem('token') || null)
const user = ref(null)

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  // 登入
  async function login(username, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || '登入失敗')
    }

    token.value = data.token
    localStorage.setItem('token', data.token)
    return data
  }

  // 註冊
  async function register(userData) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || data.message || '註冊失敗')
    }

    return data
  }

  // 取得個人資料
  async function getProfile() {
    if (!token.value) {
      throw new Error('未登入')
    }

    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      // Token 過期或無效時清除
      if (response.status === 401 || response.status === 403) {
        logout()
      }
      throw new Error(data.message || '取得資料失敗')
    }

    user.value = data.user
    return data
  }

  // 登出
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    getProfile,
    logout
  }
}
