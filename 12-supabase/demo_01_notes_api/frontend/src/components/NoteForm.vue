<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  note: {
    type: Object,
    default: null
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  title: '',
  content: '',
  userId: null
})

watch(() => props.note, (newNote) => {
  if (newNote) {
    form.value = {
      title: newNote.title,
      content: newNote.content || '',
      userId: newNote.userId
    }
  } else {
    form.value = { title: '', content: '', userId: null }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('submit', {
    ...form.value,
    userId: form.value.userId || null
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="note-form">
    <h3>{{ note ? '編輯筆記' : '新增筆記' }}</h3>

    <div class="form-group">
      <label>標題 *</label>
      <input v-model="form.title" required placeholder="請輸入標題" />
    </div>

    <div class="form-group">
      <label>內容</label>
      <textarea v-model="form.content" rows="4" placeholder="請輸入內容"></textarea>
    </div>

    <div class="form-group">
      <label>作者</label>
      <select v-model="form.userId">
        <option :value="null">（無）</option>
        <option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.name }}
        </option>
      </select>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-primary">
        {{ note ? '更新' : '新增' }}
      </button>
      <button type="button" @click="emit('cancel')" class="btn-secondary">
        取消
      </button>
    </div>
  </form>
</template>

<style scoped>
.note-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

h3 {
  margin: 0 0 15px 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
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

.btn-secondary:hover {
  background: #ccc;
}
</style>
