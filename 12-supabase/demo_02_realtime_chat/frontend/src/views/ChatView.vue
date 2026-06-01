<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { roomsApi, messagesApi } from '../services/api.js'
import { subscribeToMessages } from '../services/supabase.js'
import MessageList from '../components/MessageList.vue'
import MessageInput from '../components/MessageInput.vue'

const route = useRoute()
const router = useRouter()

const room = ref(null)
const messages = ref([])
const loading = ref(true)
const username = ref(localStorage.getItem('chat_username') || 'Anonymous')

let subscription = null

const fetchRoom = async () => {
  try {
    const res = await roomsApi.getById(route.params.id)
    room.value = res.data.data
  } catch (error) {
    console.error('Failed to fetch room:', error)
    router.push('/rooms')
  }
}

const fetchMessages = async () => {
  loading.value = true
  try {
    const res = await messagesApi.getByRoom(route.params.id)
    messages.value = res.data.data
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    loading.value = false
  }
}

const handleNewMessage = (newMessage) => {
  // 避免重複（如果已經存在就不加入）
  if (!messages.value.find(m => m.id === newMessage.id)) {
    messages.value.push(newMessage)
  }
}

const sendMessage = async (content) => {
  if (!content.trim()) return

  try {
    await messagesApi.create({
      room_id: Number(route.params.id),
      username: username.value,
      content
    })
    // 訊息會透過 Realtime 自動加入
  } catch (error) {
    alert('Failed to send message')
  }
}

onMounted(async () => {
  await fetchRoom()
  await fetchMessages()

  // 訂閱 Realtime 更新
  subscription = subscribeToMessages(route.params.id, handleNewMessage)
})

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
})
</script>

<template>
  <div class="chat-view">
    <div class="chat-header">
      <button @click="router.push('/rooms')" class="back-btn">← 返回</button>
      <h2 v-if="room">{{ room.name }}</h2>
      <span class="realtime-badge">Realtime</span>
    </div>

    <div v-if="loading" class="loading">載入中...</div>

    <template v-else>
      <MessageList :messages="messages" :currentUser="username" />
      <MessageInput @send="sendMessage" />
    </template>
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #252542;
  border-radius: 8px;
  margin-bottom: 10px;
}

.back-btn {
  padding: 8px 16px;
  background: transparent;
  color: #888;
  border: 1px solid #444;
  border-radius: 6px;
  cursor: pointer;
}

.back-btn:hover {
  color: #fff;
  border-color: #666;
}

h2 {
  margin: 0;
  flex: 1;
}

.realtime-badge {
  padding: 4px 10px;
  background: #3ecf8e;
  color: #fff;
  border-radius: 12px;
  font-size: 12px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}
</style>
