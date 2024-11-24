<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: value => ['hero', 'monster'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg w-full max-w-md">
      <!-- 英雄表單 -->
      <template v-if="type === 'hero'">
        <h2 class="text-xl font-bold mb-4">編輯英雄</h2>
        <div class="space-y-4">
          <div>
            <label class="block mb-1">名稱</label>
            <input v-model="formData.name" class="w-full border rounded p-2">
          </div>
          <div>
            <label class="block mb-1">性別</label>
            <input v-model="formData.gender" class="w-full border rounded p-2">
          </div>
          <div>
            <label class="block mb-1">年齡</label>
            <input v-model="formData.age" type="number" class="w-full border rounded p-2">
          </div>
          <div>
            <label class="block mb-1">英雄等級</label>
            <input v-model="formData.hero_level" class="w-full border rounded p-2">
          </div>
          <div>
            <label class="block mb-1">英雄排名</label>
            <input v-model="formData.hero_rank" class="w-full border rounded p-2">
          </div>
          <div>
            <label class="block mb-1">描述</label>
            <textarea v-model="formData.description" class="w-full border rounded p-2"></textarea>
          </div>
        </div>
      </template>

      <!-- 怪物表單 -->
      <template v-if="type === 'monster'">
        <h2 class="text-xl font-bold mb-4">編輯怪物</h2>
        <div class="space-y-4">
          <div>
            <label class="block mb-1">名稱</label>
            <input v-model="formData.name" class="w-full border rounded p-2">
          </div>
          <div>
            <label class="block mb-1">危險等級</label>
            <input v-model="formData.danger_level" class="w-full border rounded p-2">
          </div>
          <div>
            <label class="block mb-1">描述</label>
            <textarea v-model="formData.description" class="w-full border rounded p-2"></textarea>
          </div>
          <div>
            <label class="block mb-1">擊殺者</label>
            <input v-model="formData.kill_by" class="w-full border rounded p-2">
          </div>
        </div>
      </template>

      <div class="mt-4 space-x-2">
        <button @click="emit('save')" class="bg-green-500 text-white px-4 py-2 rounded">
          儲存
        </button>
        <button @click="emit('cancel')" class="bg-gray-500 text-white px-4 py-2 rounded">
          取消
        </button>
      </div>
    </div>
  </div>
</template>