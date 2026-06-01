<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  currentUser: {
    type: String,
    default: ''
  }
})

const listRef = ref(null)

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 新訊息時自動捲動到底部
watch(() => props.messages.length, async () => {
  await nextTick()
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
})
</script>

<template>
  <div class="message-list" ref="listRef">
    <div v-if="messages.length === 0" class="empty">
      還沒有訊息，開始聊天吧！
    </div>

    <div
      v-for="msg in messages"
      :key="msg.id"
      class="message"
      :class="{ 'is-mine': msg.username === currentUser }"
    >
      <div class="message-header">
        <span class="username">{{ msg.username }}</span>
        <span class="time">{{ formatTime(msg.created_at) }}</span>
      </div>
      <div class="message-content">{{ msg.content }}</div>
    </div>
  </div>
</template>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #1a1a2e;
  border-radius: 8px;
}

.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.message {
  max-width: 70%;
  padding: 10px 14px;
  background: #252542;
  border-radius: 12px;
  align-self: flex-start;
}

.message.is-mine {
  background: #3ecf8e;
  color: #000;
  align-self: flex-end;
}

.message-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
  font-size: 12px;
}

.username {
  font-weight: 600;
}

.time {
  color: #888;
}

.is-mine .time {
  color: rgba(0, 0, 0, 0.5);
}

.message-content {
  word-break: break-word;
}
</style>
