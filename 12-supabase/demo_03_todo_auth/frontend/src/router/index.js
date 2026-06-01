import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import TodosView from '../views/TodosView.vue'

const routes = [
  { path: '/', redirect: '/todos' },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { guest: true }
  },
  {
    path: '/todos',
    name: 'Todos',
    component: TodosView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 如果還沒初始化，先初始化
  if (!authStore.user && authStore.token) {
    await authStore.initialize()
  }

  // 需要登入的頁面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // 訪客頁面（已登入就跳轉）
  if (to.meta.guest && authStore.isAuthenticated) {
    return next('/todos')
  }

  next()
})

export default router
