<script setup>
import { ref } from 'vue'

const emit = defineEmits(['send'])
const message = ref('')

const handleSend = () => {
  if (message.value.trim()) {
    emit('send', message.value)
    message.value = ''
  }
}
</script>

<template>
  <div class="message-input">
    <input
      v-model="message"
      placeholder="輸入訊息..."
      @keyup.enter="handleSend"
    />
    <button @click="handleSend">發送</button>
  </div>
</template>

<style scoped>
.message-input {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}

input {
  flex: 1;
  padding: 14px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #252542;
  color: #fff;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #3ecf8e;
}

button {
  padding: 14px 24px;
  background: #3ecf8e;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #38b880;
}
</style>
