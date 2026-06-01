<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { todosApi } from '../services/api.js'
import TodoItem from '../components/TodoItem.vue'
import TodoForm from '../components/TodoForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const todos = ref([])
const loading = ref(false)
const error = ref(null)

const fetchTodos = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await todosApi.getAll()
    todos.value = res.data.data
  } catch (err) {
    error.value = err.response?.data?.error || '無法載入待辦事項'
  } finally {
    loading.value = false
  }
}

const addTodo = async (title) => {
  try {
    const res = await todosApi.create({ title })
    todos.value.unshift(res.data.data)
  } catch (err) {
    error.value = err.response?.data?.error || '新增失敗'
  }
}

const toggleTodo = async (todo) => {
  try {
    const res = await todosApi.update(todo.id, { completed: !todo.completed })
    const index = todos.value.findIndex(t => t.id === todo.id)
    if (index !== -1) {
      todos.value[index] = res.data.data
    }
  } catch (err) {
    error.value = err.response?.data?.error || '更新失敗'
  }
}

const deleteTodo = async (id) => {
  try {
    await todosApi.delete(id)
    todos.value = todos.value.filter(t => t.id !== id)
  } catch (err) {
    error.value = err.response?.data?.error || '刪除失敗'
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchTodos()
})
</script>

<template>
  <div class="todos-container">
    <div class="todos-card">
      <header class="header">
        <h1>待辦事項</h1>
        <div class="user-info">
          <span>{{ authStore.user?.email }}</span>
          <button class="logout-btn" @click="handleLogout">登出</button>
        </div>
      </header>

      <TodoForm @submit="addTodo" />

      <div v-if="error" class="error">
        {{ error }}
      </div>

      <div v-if="loading" class="loading">
        載入中...
      </div>

      <div v-else-if="todos.length === 0" class="empty">
        還沒有待辦事項，新增一個吧！
      </div>

      <ul v-else class="todo-list">
        <TodoItem
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          @toggle="toggleTodo"
          @delete="deleteTodo"
        />
      </ul>
    </div>
  </div>
</template>

<style scoped>
.todos-container {
  width: 100%;
  max-width: 600px;
}

.todos-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

h1 {
  margin: 0;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
  font-size: 14px;
}

.logout-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #eee;
}

.error {
  background: #fee;
  color: #c00;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.loading, .empty {
  text-align: center;
  color: #999;
  padding: 40px;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
