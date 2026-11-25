# 第 4 堂 · Middleware 應用

> 對應課綱第 4 堂（內建、第三方、自訂 middleware）。延續第 3 堂的 todo app。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：在 todo app 裡用上三種 middleware：內建的 `express.json()`、第三方的 `morgan`、自己寫的驗證 middleware，並用 middleware 讓找不到的路徑回 JSON 格式的 404。

**搞懂**：
- middleware 的形狀 `(req, res, next)`，`next()` 在做什麼
- 執行順序為什麼由 `app.use` 的先後決定
- 全域 middleware（`app.use`）和路由層級 middleware（寫在路由參數裡）的差別
- 怎麼找、怎麼裝第三方 middleware

---

## ② 前置檢查

- [ ] 完成[第 3 堂](../03-express-basics-and-routing/)，手上有能跑的 todo app（或直接複製[第 3 堂完成版](../03-express-basics-and-routing/完成版/)）。
- [ ] 會用 curl、REST Client 或 Postman 打 API。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–1 | 搞懂 middleware 的形狀、拿掉 `express.json()` 看後果 | A |
| 2 | 自訂 logger middleware | B |
| 3 | 換成第三方 `morgan` | C |
| 4 | 路由層級的驗證 middleware | D |
| 5 | 用 middleware 處理 404，體會順序的重要 | E（完成版） |

完成版程式碼放在 [`完成版/`](./完成版/)，卡關時可比對。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [Express Middleware](../concepts/express-middleware.md)：middleware 的形狀、用途、執行順序

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試[課堂練習](./課堂練習.md)：自己寫兩個 middleware，一個全域、一個路由層級。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm install
npm run dev
```

逐一測試：

- [ ] 每打一次 API，終端機都有 morgan 的記錄
- [ ] `POST /todos` 缺 title 回 400，有 title 回 201
- [ ] 打不存在的路徑回 404，而且是 JSON
- [ ] `GET /todos` 等既有路由照常運作

### 挑戰（可選，加深理解）

1. **只對某個路徑生效**：寫一個 middleware，用 `app.use('/todos', ...)` 掛上去，確認打 `/` 時不會執行。
2. **多個路由層級 middleware**：`app.post('/todos', a, b, handler)`，讓 `a`、`b` 各印一行，確認執行順序。
3. **morgan 的格式**：把 `'dev'` 換成 `'tiny'` 或 `'combined'`，比較輸出差在哪。

---

**下一堂 → [第 5 堂 · RESTful API 設計](../05-restful-api-design/)**
