# 第 3 堂 · Express 入門與路由設計：todo app 的起點

> 對應課綱第 3 堂（route、request / response）。從這堂開始建立貫穿整門課的 todo app。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：一個用 Express 寫的 todo API，可以列出全部 todo（含篩選）、查單筆、新增一筆。

**搞懂**：
- Express 的路由怎麼對應 HTTP 方法和路徑
- 請求的資料從哪裡來：`req.params`、`req.query`、`req.body`
- 怎麼回應：`res.json`、`res.status`、`res.send`
- Express 比第 1 堂的原生 http 省掉了什麼

> 這堂的資料先存在記憶體（重啟就消失）。我們刻意先把 HTTP 和路由這層學透，第 11 堂再接資料庫。

---

## ② 前置檢查

開始前，確認你具備：

- [ ] **Node.js 22 LTS 以上**（`node -v` 確認）。
- [ ] 學過[第 1 堂](../01-nodejs-core-and-modules/)（ESM `import` / `export`、npm、`package.json`）和[第 2 堂](../02-async-and-event-loop/)（async/await）。
- [ ] 一個能打 API 的工具：VS Code 的 REST Client 擴充、Postman，或終端機的 `curl`。

> 不需要先會資料庫、前端或任何框架。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–1 | 建專案、跑起第一個伺服器 | A |
| 2–3 | 準備資料、用 params / query / body 寫三個路由 | B（完成版） |

完成版程式碼放在 [`完成版/`](./完成版/)，卡關時可比對。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [HTTP 狀態碼](../concepts/http-狀態碼.md)：先有個印象，第 5 堂會完整整理

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試[課堂練習](./課堂練習.md)：不看程式碼、自己用 params / query / body 寫出一個新資源 `/books`。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm install
npm run dev
```

逐一測試：

- [ ] `GET /todos` 回傳陣列
- [ ] `GET /todos?completed=true` 只回傳已完成的 todo
- [ ] `GET /todos/:id` 找得到回 200、找不到回 404
- [ ] `POST /todos` 帶 `{"title":"..."}` 回 201；不帶 title 回 400

### 挑戰（可選，加深理解）

1. **關鍵字搜尋**：讓 `GET /todos?q=牛奶` 只回傳 title 包含「牛奶」的 todo。
2. **排序**：讓 `GET /todos?sort=title` 依 title 排序。
3. **抽出路由**：用 `express.Router()` 把 todo 相關路由搬到另一個檔案，再用 `app.use('/todos', router)` 掛回來（第 6 堂會用到這個結構）。

---

**下一堂 → [第 4 堂 · Middleware 應用](../04-middleware/)**
