# 第 5 堂 · RESTful API 設計

> 對應課綱第 5 堂（資源設計、HTTP 方法、狀態碼）。延續第 4 堂的 todo app。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：補上更新（PATCH）和刪除（DELETE），讓 todo API 有完整的 CRUD，並整理出一份 API 對照表。

**搞懂**：
- RESTful 的三個原則：網址代表資源、動作交給 HTTP 方法、結果交給狀態碼
- CRUD 各自該回哪個狀態碼（200、201、204、400、404）
- PUT 和 PATCH 的差別
- 為什麼先檢查 404 再檢查 400

---

## ② 前置檢查

- [ ] 完成[第 4 堂](../04-middleware/)，手上有能跑的 todo app（或直接複製[第 4 堂完成版](../04-middleware/完成版/)）。
- [ ] 會用 curl、REST Client 或 Postman 打 API。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0 | RESTful 的三個原則 | A |
| 1 | 部分更新（PATCH） | B |
| 2 | 刪除（DELETE） | C |
| 3 | 整理 API 對照表 | D（完成版） |

完成版程式碼放在 [`完成版/`](./完成版/)，卡關時可比對。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [HTTP 狀態碼](../concepts/http-狀態碼.md)：CRUD 對照、PUT vs PATCH

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試[課堂練習](./課堂練習.md)：不看程式碼、自己把 REST 模式套到一個新資源 `/bookmarks`。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm install
npm run dev
```

逐一測試：

- [ ] `GET /todos` 回傳陣列
- [ ] `POST /todos` 帶 `{"title":"..."}` 回 201；不帶 title 回 400
- [ ] `GET /todos/:id` 找得到回 200、找不到回 404
- [ ] `PATCH /todos/:id` 帶 `{"completed":true}` 能改狀態；型別錯回 400
- [ ] `DELETE /todos/:id` 回 204；刪不存在的回 404
- [ ] 打一個不存在的路徑回 404（JSON 格式）

### 挑戰（可選，加深理解）

1. **PUT**：加一個 `PUT /todos/:id`，要求 `title` 和 `completed` 都必須送，缺一個就回 400。比較它和 PATCH 用起來的差別。
2. **巢狀資源**：想想「某個清單底下的 todo」的網址該怎麼設計？（第 12 堂接資料庫關聯時會用到。）
3. **Location header**：新增成功時，在回應加上 `Location: /todos/<新 id>`。

---

**下一堂 → [第 6 堂 · 錯誤處理機制](../06-error-handling/)**
