<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import CardList from './components/CardList.vue'
import EditModal from './components/EditModal.vue'
import MessageAlert from './components/MessageAlert.vue'

// 狀態部分
const heroes = ref([])
const monsters = ref([])
const editingItem = ref(null)
const editingType = ref(null)
const error = ref('')
const message = ref('')

const API_URL = 'http://localhost:3000'

// API 使用
const fetchHeroes = async () => {
  try {
    // const response = await fetch(`${API_URL}/heroes`)
    // if (!response.ok) throw new Error('Network response was not ok')
    // const data = await response.json()
    // heroes.value = data
    const response = await axios.get(`${API_URL}/heroes`)
    heroes.value = response.data
  } catch (err) {
    error.value = '獲取英雄資料失敗：' + err.message
  }
}

const fetchMonsters = async () => {
  try {
    // const response = await fetch(`${API_URL}/monsters`)
    // if (!response.ok) throw new Error('Network response was not ok')
    // const data = await response.json()
    // monsters.value = data
    const response = await axios.get(`${API_URL}/monsters`)
    monsters.value = response.data
  } catch (err) {
    error.value = '獲取怪物資料失敗：' + err.message
  }
}

// 編輯
const handleEdit = (item, type) => {
  editingItem.value = { ...item }
  editingType.value = type
}

const handleSave = async () => {
  try {
    const endpoint = editingType.value === 'hero' ? 'heroes' : 'monsters'
    // const response = await fetch(`${API_URL}/${endpoint}/${editingItem.value.id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(editingItem.value)
    // })
    const response = await axios.put(`${API_URL}/${endpoint}/${editingItem.value.id}`, editingItem.value)

    // if (!response.ok) throw new Error('Network response was not ok')

    message.value = `更新${editingType.value === 'hero' ? '英雄' : '怪物'}成功`
    editingItem.value = null

    // fetchHeroes()
    // fetchMonsters()
    await Promise.all([fetchHeroes(), fetchMonsters()])
  } catch (err) {
    error.value = '更新失敗：' + err.message
  }
}

// 刪除英雄
const handleDelete = async (id) => {
  if (!confirm('確定要刪除這位英雄嗎？')) return

  try {
    // const response = await fetch(`${API_URL}/heroes/${id}`, {
    //   method: 'DELETE'
    // })
    // if (!response.ok) throw new Error('Network response was not ok')

    await axios.delete(`${API_URL}/heroes/${id}`)
    message.value = '英雄刪除成功'
    await fetchHeroes()
  } catch (err) {
    error.value = '刪除英雄失敗：' + err.message
  }
}

// 清除訊息
const clearMessage = () => {
  error.value = ''
  message.value = ''
}

onMounted(async () => {
  await Promise.all([fetchHeroes(), fetchMonsters()])
})
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- 訊息提示 -->
    <MessageAlert v-if="error" :message="error" type="error" @close="clearMessage" />
    <MessageAlert v-if="message" :message="message" type="success" @close="clearMessage" />

    <!-- 英雄列表 -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">英雄列表</h2>
      <CardList :items="heroes" type="hero" @edit="item => handleEdit(item, 'hero')" @delete="handleDelete" />
    </div>

    <!-- 怪物列表 -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">怪物列表</h2>
      <CardList :items="monsters" type="monster" @edit="item => handleEdit(item, 'monster')" />
    </div>

    <!-- 編輯 modal -->
    <EditModal v-if="editingItem" v-model="editingItem" :type="editingType" @save="handleSave"
      @cancel="editingItem = null" />
  </div>
</template>