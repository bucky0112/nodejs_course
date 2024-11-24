<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: value => ['hero', 'monster'].includes(value)
  }
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div v-for="item in items" :key="item.id" class="border rounded p-4 shadow-sm">
      <h3 class="text-xl font-semibold">{{ item.name }}</h3>

      <!-- 英雄卡片內容 -->
      <template v-if="type === 'hero'">
        <p>等級: {{ item.hero_level }}</p>
        <p>排名: {{ item.hero_rank }}</p>
      </template>

      <!-- 怪物卡片內容 -->
      <template v-if="type === 'monster'">
        <p>危險等級: {{ item.danger_level }}</p>
        <p v-if="item.kill_by">擊殺者: {{ item.kill_by }}</p>
      </template>

      <div class="mt-4 space-x-2">
        <button @click="emit('edit', item)" class="bg-blue-500 text-white px-4 py-2 rounded">
          編輯
        </button>
        <button v-if="type === 'hero'" @click="emit('delete', item.id)" class="bg-red-500 text-white px-4 py-2 rounded">
          刪除
        </button>
      </div>
    </div>
  </div>
</template>