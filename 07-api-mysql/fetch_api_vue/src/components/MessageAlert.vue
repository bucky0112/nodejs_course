<script setup>
defineProps({
  message: String,
  type: {
    type: String,
    default: 'success',
    validator: value => ['success', 'error'].includes(value)
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div :class="[
    'px-4 py-3 rounded mb-4',
    type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
  ]">
    {{ message }}
    <button @click="emit('close')" class="float-right">&times;</button>
  </div>
</template>