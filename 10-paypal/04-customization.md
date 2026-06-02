# PayPal 金流按鈕自訂教學

## ✅ 僅顯示信用卡付款按鈕
```js
paypal.Buttons({
  fundingSource: paypal.FUNDING.CARD,
  createOrder: ...,
  onApprove: ...
}).render('#card-button')
```

## 🌍 設定語言與幣別
```js
loadScript({
  'client-id': '你的ID',
  currency: 'TWD',
  locale: 'zh_TW',
  components: 'buttons'
})
```

## 🧠 檢查付款方式可用性

`@paypal/paypal-js` 並沒有頂層的 `getFundingEligibility` 函式；要判斷某種
付款方式是否可用，應透過 `loadScript` 載入後的 `paypal` 物件，用
`paypal.Buttons({ fundingSource }).isEligible()` 來檢查：

```js
import { loadScript } from '@paypal/paypal-js'

const paypal = await loadScript({
  'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: 'TWD'
})

// 檢查「信用卡」這個付款來源是否可用
const cardEligible = paypal
  .Buttons({ fundingSource: paypal.FUNDING.CARD })
  .isEligible()

console.log(cardEligible) // true / false
```
