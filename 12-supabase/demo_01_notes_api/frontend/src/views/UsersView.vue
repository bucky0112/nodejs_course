<script setup>
import { ref, onMounted } from 'vue'
import { usersApi } from '../services/api.js'

const users = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingUser = ref(null)
const form = ref({ name: '', email: '' })

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await usersApi.getAll()
    users.value = res.data.data
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    if (editingUser.value) {
      await usersApi.update(editingUser.value.id, form.value)
    } else {
      await usersApi.create(form.value)
    }
    resetForm()
    await fetchUsers()
  } catch (error) {
    alert(error.response?.data?.error || 'Operation failed')
  }
}

const handleEdit = (user) => {
  editingUser.value = user
  form.value = { name: user.name, email: user.email }
  showForm.value = true
}

const handleDelete = async (id) => {
  if (!confirm('確定要刪除這個使用者嗎？相關的筆記也會一併刪除。')) return
  try {
    await usersApi.delete(id)
    await fetchUsers()
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to delete user')
  }
}

const resetForm = () => {
  showForm.value = false
  editingUser.value = null
  form.value = { name: '', email: '' }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="users-view">
    <div class="header">
      <h2>使用者列表</h2>
      <button @click="showForm = true" class="btn-primary" v-if="!showForm">
        新增使用者
      </button>
    </div>

    <form v-if="showForm" @submit.prevent="handleSubmit" class="user-form">
      <div class="form-group">
        <label>姓名</label>
        <input v-model="form.name" required placeholder="請輸入姓名" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" required placeholder="請輸入 Email" />
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary">
          {{ editingUser ? '更新' : '新增' }}
        </button>
        <button type="button" @click="resetForm" class="btn-secondary">取消</button>
      </div>
    </form>

    <div v-if="loading" class="loading">載入中...</div>

    <div v-else-if="users.length === 0" class="empty">
      還沒有任何使用者，新增一個吧！
    </div>

    <table v-else class="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>Email</th>
          <th>筆記數</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.notes?.length || 0 }}</td>
          <td>
            <button @click="handleEdit(user)" class="btn-small">編輯</button>
            <button @click="handleDelete(user.id)" class="btn-small btn-danger">刪除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
}

.btn-primary {
  background: #3ecf8e;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background: #38b880;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.user-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #666;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background: #f5f5f5;
  font-weight: 600;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  background: #e0e0e0;
}

.btn-small:hover {
  background: #ccc;
}

.btn-danger {
  background: #ff6b6b;
  color: #fff;
}

.btn-danger:hover {
  background: #e55555;
}
</style>
