# 概念卡：Express Middleware

> 一句話：middleware 是一串「**夾在請求進來、回應送出之間**」依序執行的函式，每個都能讀寫 `req`/`res`，再用 `next()` 把棒子交給下一棒。

---

## 一、形狀

```js
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()   // ← 不呼叫 next()，請求就會卡在這裡
}

app.use(logger)
```

三個參數 `(req, res, next)`：
- `req`：這次的請求（網址、header、body…）
- `res`：你要送回去的回應
- `next`：呼叫它，交給下一個 middleware/路由

**關鍵心智模型**：middleware 像生產線，請求由上往下經過每一站。你 `app.use(...)` 的順序，就是執行順序。

---

## 二、兩種常見用途

### 1. 處理每個請求都要做的事

```js
app.use(express.json())   // 內建：把 JSON 請求主體解析成 req.body
```

沒有這行，`req.body` 會是 undefined——這是新手最常見的「為什麼收不到資料」。

### 2. 中途攔截

middleware 可以決定「不放行」，直接回應、不呼叫 `next()`：

```js
const requireToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: '請先登入' })  // ← 攔下，不放行
  }
  next()
}
```

這就是「保護路由」的做法：登入驗證、權限檢查，都是在路由前面放一個會攔人的 middleware。

---

## 三、執行順序的兩個重點

1. **由上往下**：先 `app.use(A)` 再 `app.use(B)`，A 先跑。
2. **路由本身也是 middleware**：`app.get('/todos', handler)` 的 `handler` 就是只在符合條件時才跑的 middleware。所以「解析 JSON」「記錄請求」這類要擺在路由**前面**，才會對所有路由生效。

> 錯誤處理 middleware 是特例（四個參數、放最後），詳見[概念卡：Express 的錯誤處理](./express-錯誤處理.md)。

---

## 延伸
- `app.use('/admin', someMiddleware)` 可以只對某個路徑前綴生效。
- `app.post('/todos', validateTitle, handler)`：把 middleware 寫在路由的參數裡，就只對這個路由生效（路由層級 middleware）。
- 常用第三方 middleware：`morgan`（請求記錄，[第 4 堂](../04-middleware/)會用到）、`cors`（跨來源）、`helmet`（安全標頭）。
