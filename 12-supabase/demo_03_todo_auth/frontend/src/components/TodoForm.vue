<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

const title = ref('')

const handleSubmit = () => {
  const trimmedTitle = title.value.trim()
  if (!trimmedTitle) return

  emit('submit', trimmedTitle)
  title.value = ''
}
</script>

<template>
  <form class="todo-form" @submit.prevent="handleSubmit">
    <input
      v-model="title"
      type="text"
      placeholder="新增待辦事項..."
      class="todo-input"
    />
    <button type="submit" class="add-btn">新增</button>
  </form>
</template>

<style scoped>
.todo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.todo-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.todo-input:focus {
  outline: none;
  border-color: #3ecf8e;
}

.add-btn {
  padding: 12px 24px;
  background: #3ecf8e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #38b27e;
}
</style>
