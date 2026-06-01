<script setup>
defineProps({
  note: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="note-card">
    <div class="note-header">
      <h3>{{ note.title }}</h3>
      <div class="note-actions">
        <button @click="emit('edit', note)" class="btn-icon" title="編輯">
          ✏️
        </button>
        <button @click="emit('delete', note.id)" class="btn-icon" title="刪除">
          🗑️
        </button>
      </div>
    </div>
    <p class="note-content">{{ note.content || '（無內容）' }}</p>
    <div class="note-meta">
      <span v-if="note.user" class="author">👤 {{ note.user.name }}</span>
      <span class="date">📅 {{ formatDate(note.createdAt) }}</span>
    </div>
  </div>
</template>

<style scoped>
.note-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}

.note-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.note-actions {
  display: flex;
  gap: 5px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.note-content {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.note-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #888;
}
</style>
