# M1 · Express 骨架：todo app 的起點

> 主線章節（spine）。本章開始建立貫穿整門課的 todo app。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：一個用 Express 寫的 todo API，支援列表、單筆查詢、新增、更新、刪除（CRUD），有輸入驗證、請求記錄與集中錯誤處理。

**搞懂**：
- Express 的路由怎麼對應 HTTP 方法
- middleware 是什麼、執行順序為什麼重要
- 怎麼回傳正確的 HTTP 狀態碼
- 錯誤處理該集中在哪、Express 5 幫你做了什麼

> 這一章的資料先存在記憶體（重啟就消失）。「換成真資料庫」是下一章 [M2] 的事——我們刻意先把 HTTP/路由這層學透，再加資料庫。

---

## ② 前置檢查

開始前，確認你具備：

- [ ] **Node.js 22 LTS 以上**（`node -v` 確認）。本課程所有範例以 Node 22 為基準。
- [ ] 學過 [S0 · Node.js 基礎]（ESM `import`/`export`、npm、`package.json`）。
- [ ] 一個能打 API 的工具：VS Code 的 REST Client 擴充、Postman，或終端機的 `curl`。

> 不需要先會資料庫、前端或任何框架。

---

## ③ 工作坊

跟著一步步把 todo app 建起來，每個步驟都有檢查點：

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–1 | 建專案、跑起第一個伺服器 | A |
| 2–3 | 解析 JSON、讀取與新增 todo | B |
| 4 | 單筆查詢、更新（PATCH）、刪除 | C |
| 5–6 | 請求記錄、404 與錯誤處理 | D（完成版） |

完成版程式碼放在 [`完成版/`](./完成版/)，卡關時可比對。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

這些是獨立的說明，工作坊步驟裡會在對應時機連到它們，課後也能單獨複習：

- [Express Middleware](../concepts/express-middleware.md) — middleware 的形狀、用途、執行順序
- [HTTP 狀態碼](../concepts/http-狀態碼.md) — CRUD 對照、PUT vs PATCH
- [Express 的錯誤處理](../concepts/express-錯誤處理.md) — 四參數 middleware、Express 5 的 async 自動轉交、常見陷阱

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試 [課堂練習](./課堂練習.md)——不看程式碼、自己把這章的 REST 模式套到一個新資源 `/notes`。練的是「能不能獨立寫出來」，跟下面的挑戰（延伸功能）分工。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm install
npm run dev
```

逐一測試（應該都通過）：

- [ ] `GET /todos` 回傳陣列
- [ ] `POST /todos` 帶 `{"title":"..."}` 回 201；不帶 title 回 400
- [ ] `GET /todos/:id` 找得到回 200、找不到回 404
- [ ] `PATCH /todos/:id` 帶 `{"completed":true}` 能改狀態
- [ ] `DELETE /todos/:id` 回 204；刪不存在的回 404
- [ ] 打一個不存在的路徑回 404（JSON 格式）

### 挑戰（可選，加深理解）

1. **查詢過濾**：讓 `GET /todos?completed=true` 只回傳已完成的 todo。
2. **排序**：新增 `GET /todos?sort=createdAt` 依建立時間排序。
3. **抽出路由**：把 todo 相關路由搬到 `express.Router()`，讓 `app.js` 更乾淨（這是 [M2] 之後會用到的結構）。

---

**下一章 → [M2 · 接資料庫：把 todo 存進 PostgreSQL]**
