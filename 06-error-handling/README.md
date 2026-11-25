# 第 6 堂 · 錯誤處理機制：統一出口與三層架構

> 對應課綱第 6 堂（error middleware、驗證、統一回應）。延續第 5 堂的 todo app，並把它整理成之後一路沿用的三層結構。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：一個錯誤處理 middleware 當所有錯誤的出口、一個 `HttpError` 類別，並把 todo app 拆成 routes、controllers、services 三層。API 行為不變，所有錯誤都回一致的 JSON。

**搞懂**：
- 錯誤處理 middleware 為什麼要四個參數、為什麼放最後
- 為什麼 5xx 錯誤不能把訊息直接回給前端
- 用 `throw new HttpError(...)` 取代到處 `return res.status(...)`
- Express 5 怎麼自動接住 async 函式拋出的錯誤
- 三層各自的職責，以及 `app.js` 和 `server.js` 為什麼要分開

---

## ② 前置檢查

- [ ] 完成[第 5 堂](../05-restful-api-design/)，手上有完整 CRUD 的 todo app（或直接複製[第 5 堂完成版](../05-restful-api-design/完成版/)）。
- [ ] 會用 curl、REST Client 或 Postman 打 API。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0 | 觀察現在的錯誤回應有什麼問題 | A |
| 1 | 錯誤處理 middleware | B |
| 2 | `HttpError` 類別 | C |
| 3 | 拆成 routes / controllers / services | D（完成版） |

完成版程式碼放在 [`完成版/`](./完成版/)，卡關時可比對。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [Express 的錯誤處理](../concepts/express-錯誤處理.md)：四參數 middleware、Express 5 的 async 自動轉交、常見陷阱
- [分層架構](../concepts/分層架構.md)：三層的職責邊界、app.js 與 server.js 分開的理由

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試[課堂練習](./課堂練習.md)：自己照三層結構加上一個新資源 `/bookmarks`。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm install
npm run dev
```

逐一測試：

- [ ] 第 5 堂驗收清單的每一條都還是一樣的結果
- [ ] 送壞掉的 JSON（`-d '{bad'`）回 400 `{"error":"請求的 JSON 格式錯誤"}`
- [ ] `PATCH /todos/1` 送空物件 `{}` 回 400 `{"error":"沒有提供要更新的欄位"}`
- [ ] 所有錯誤回應都是 `{ "error": "..." }` 的形狀
- [ ] `src/controllers/` 裡沒有任何 try/catch，也沒有驗證規則

### 挑戰（可選，加深理解）

1. **錯誤代碼**：讓錯誤回應多一個機器看得懂的 `code` 欄位，例如 `{ "error": "找不到這筆 todo", "code": "TODO_NOT_FOUND" }`。`HttpError` 要怎麼改？
2. **serializer**：讓 API 回應的 todo 不包含 `createdAt`，但 service 內部還是保留它。這段轉換該放在哪一層？
3. **Express 4 的做法**：查查看 Express 4 的 async controller 為什麼要包 try/catch，比較兩種寫法。

---

**下一堂 → [第 7 堂 · AI 輔助生成 API 架構](../07-ai-assisted-api-scaffolding/)**
