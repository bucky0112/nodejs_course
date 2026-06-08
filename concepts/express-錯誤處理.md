# 概念卡：Express 的錯誤處理

> 一句話：Express 用「**四個參數**的 middleware」集中處理錯誤；在 Express 5，async 函式拋出的錯誤會**自動**被送到這裡。

這張卡是給「想搞懂為什麼」的人看的。工作坊步驟裡照著做就會動，這裡解釋背後的道理。

---

## 一、錯誤處理 middleware 長什麼樣

一般 middleware 是三個參數 `(req, res, next)`。**錯誤處理 middleware 是四個參數 `(err, req, res, next)`**——Express 就是靠「參數數量是 4」來辨認它是錯誤處理器：

```js
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || '伺服器發生錯誤' })
})
```

兩個關鍵規則：

1. **一定放在所有路由的最後面**。Express 是由上往下逐一比對 middleware，錯誤處理器要擺最後才能接到前面所有路由丟出的錯。
2. **四個參數一個都不能少**，即使 `next` 沒用到也要寫。少一個就會被當成普通 middleware，錯誤接不到。

---

## 二、怎麼把錯誤「丟」進去

在路由裡呼叫 `next(err)`，就會跳過後面所有正常 middleware，直接交給錯誤處理器：

```js
app.get('/todos/:id', (req, res, next) => {
  const todo = findTodo(req.params.id)
  if (!todo) {
    const err = new Error('找不到這筆 todo')
    err.status = 404
    return next(err)   // ← 交給錯誤處理 middleware
  }
  res.json(todo)
})
```

> M1 的完成版為了單純，是在每個路由裡直接 `res.status(404)` 回應。等到後面章節邏輯變複雜（查資料庫、驗證），`next(err)` 集中處理的好處才會明顯。

---

## 三、Express 5 的重要改變：async 錯誤自動轉交

這是 Express 5 相對 Express 4 最值得記住的一點。

**Express 4**：async 路由裡 `throw` 或 reject 的錯誤**不會**被自動接住，伺服器會卡住。你必須自己包 try/catch。

**Express 5**：async 路由函式回傳的 Promise 一旦 reject，Express **會自動幫你呼叫 `next(err)`**。所以這樣就夠了：

```js
app.get('/todos', async (req, res) => {
  const todos = await db.getTodos()   // 萬一這裡拋錯…
  res.json(todos)                     // …Express 5 會自動轉交給錯誤處理器
})
```

不必再到處包 try/catch。（這也是為什麼本課程鎖定 Express 5。）

---

## 四、常見陷阱

### 陷阱 1：重複送出回應（double response）

一個請求只能回應**一次**。下面這段會炸 `ERR_HTTP_HEADERS_SENT`：

```js
// ✗ 錯誤示範
const getUser = async (req, res) => {
  res.json(user)            // 這裡已經回應了
}
app.get('/users/:id', async (req, res) => {
  const u = await getUser(req, res)
  res.json(u)               // ✗ 又回應一次 → 爆炸
})
```

原則：**一個函式如果負責「回應」，就不要再回傳資料給別人去回應**。要嘛函式只回傳資料、由路由統一回應；要嘛函式自己回應、外面就別碰 `res`。

### 陷阱 2：try/catch 包了等於沒包

如果裡層函式自己把錯誤吞掉（catch 後回 500），外層的 try/catch 永遠進不去——因為根本沒有錯誤被拋出來。別讓錯誤在兩個地方各處理一半。

---

## 延伸
- 在 Express 5，沒被任何路由匹配到的請求，可以用一個放在最後、沒有四參數的 `app.use((req, res) => ...)` 當 404 處理（要放在錯誤處理器之前）。
- 之後 [M5 JWT] 的驗證 middleware 會用 `next(err)` 把 401/403 丟給這裡集中處理。
