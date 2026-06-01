<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { roomsApi } from '../services/api.js'

const router = useRouter()
const rooms = ref([])
const loading = ref(true)
const newRoomName = ref('')
const username = ref(localStorage.getItem('chat_username') || '')

const fetchRooms = async () => {
  loading.value = true
  try {
    const res = await roomsApi.getAll()
    rooms.value = res.data.data
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
  } finally {
    loading.value = false
  }
}

const createRoom = async () => {
  if (!newRoomName.value.trim()) return

  try {
    await roomsApi.create({ name: newRoomName.value })
    newRoomName.value = ''
    await fetchRooms()
  } catch (error) {
    alert('Failed to create room')
  }
}

const enterRoom = (roomId) => {
  if (!username.value.trim()) {
    alert('請先輸入你的名字')
    return
  }
  localStorage.setItem('chat_username', username.value)
  router.push(`/rooms/${roomId}`)
}

onMounted(fetchRooms)
</script>

<template>
  <div class="rooms-view">
    <div class="username-section">
      <label>你的名字：</label>
      <input v-model="username" placeholder="輸入你的名字" />
    </div>

    <div class="create-room">
      <input
        v-model="newRoomName"
        placeholder="新聊天室名稱"
        @keyup.enter="createRoom"
      />
      <button @click="createRoom">建立</button>
    </div>

    <div v-if="loading" class="loading">載入中...</div>

    <div v-else-if="rooms.length === 0" class="empty">
      還沒有任何聊天室，建立一個吧！
    </div>

    <div v-else class="rooms-list">
      <div
        v-for="room in rooms"
        :key="room.id"
        class="room-card"
        @click="enterRoom(room.id)"
      >
        <span class="room-name">{{ room.name }}</span>
        <span class="room-arrow">→</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rooms-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.username-section {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #252542;
  padding: 15px;
  border-radius: 8px;
}

.username-section label {
  color: #888;
}

.username-section input {
  flex: 1;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #1a1a2e;
  color: #fff;
  font-size: 14px;
}

.create-room {
  display: flex;
  gap: 10px;
}

.create-room input {
  flex: 1;
  padding: 12px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #252542;
  color: #fff;
  font-size: 14px;
}

.create-room button {
  padding: 12px 24px;
  background: #3ecf8e;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.create-room button:hover {
  background: #38b880;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #888;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.room-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #252542;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.room-card:hover {
  background: #2d2d4a;
}

.room-name {
  font-size: 16px;
}

.room-arrow {
  color: #3ecf8e;
  font-size: 20px;
}
</style>
