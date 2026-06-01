<script setup>
defineProps({
  todo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle', 'delete'])
</script>

<template>
  <li class="todo-item" :class="{ completed: todo.completed }">
    <label class="checkbox-label">
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="emit('toggle', todo)"
      />
      <span class="checkmark"></span>
    </label>

    <span class="title">{{ todo.title }}</span>

    <button class="delete-btn" @click="emit('delete', todo.id)">
      刪除
    </button>
  </li>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #fafafa;
}

.todo-item:last-child {
  border-bottom: none;
}

.checkbox-label {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  width: 22px;
  height: 22px;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: all 0.2s;
}

.checkbox-label input:checked ~ .checkmark {
  background: #3ecf8e;
  border-color: #3ecf8e;
}

.checkmark::after {
  content: '';
  position: absolute;
  display: none;
  left: 8px;
  top: 4px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label input:checked ~ .checkmark::after {
  display: block;
}

.title {
  flex: 1;
  margin-left: 15px;
  font-size: 16px;
  color: #333;
  transition: all 0.2s;
}

.completed .title {
  text-decoration: line-through;
  color: #999;
}

.delete-btn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #999;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fee;
  border-color: #fcc;
  color: #c00;
}
</style>
