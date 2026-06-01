import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 設定 token
  const setToken = (accessToken) => {
    token.value = accessToken
    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    } else {
      localStorage.removeItem('access_token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  // 初始化：檢查是否有 token 並取得使用者資料
  const initialize = async () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      try {
        const res = await api.get('/auth/me')
        user.value = res.data.data
      } catch (err) {
        // Token 無效，清除
        setToken(null)
        user.value = null
      }
    }
  }

  // 註冊
  const register = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.post('/auth/register', { email, password })
      const { user: userData, session } = res.data.data

      if (session) {
        user.value = userData
        setToken(session.access_token)
      }

      return res.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Registration failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // 登入
  const login = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.post('/auth/login', { email, password })
      const { user: userData, session } = res.data.data

      user.value = userData
      setToken(session.access_token)

      return res.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Login failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      // 忽略錯誤，繼續登出
    }

    user.value = null
    setToken(null)
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    initialize,
    register,
    login,
    logout
  }
})
