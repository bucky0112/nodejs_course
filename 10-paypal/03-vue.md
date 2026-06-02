# 在 Vue 中整合 PayPal 金流

## 1. 安裝 PayPal SDK
```bash
npm install @paypal/paypal-js
```

## 2. 載入並渲染 PayPal 按鈕

`App.vue`
```vue
<template>
  <div ref="paypalRef"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadScript } from '@paypal/paypal-js'

const paypalRef = ref(null)
// 後端 API 的網址用環境變數，避免相對路徑在前後端不同 port 時打到 vite dev server 而 404
const API_URL = import.meta.env.VITE_API_URL

onMounted(async () => {
  const paypal = await loadScript({
    'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: 'TWD',
    locale: 'zh_TW',
    components: 'buttons'
  })

  if (paypal?.Buttons) {
    paypal.Buttons({
      createOrder: async () => {
        const res = await fetch(`${API_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cart: [] }) });
        const orderData = await res.json()
        return orderData.id
      },
      onApprove: async (data) => {
        const res = await fetch(`${API_URL}/api/orders/${data.orderID}/capture`, { method: 'POST' })
        const captureData = await res.json()
        console.log('付款成功:', captureData)
      }
    }).render(paypalRef.value)
  }
})
</script>
```

## 3. 前端環境變數
在 `.env` 檔設定：
```
VITE_PAYPAL_CLIENT_ID=你的clientID
VITE_API_URL=http://localhost:3000
```
