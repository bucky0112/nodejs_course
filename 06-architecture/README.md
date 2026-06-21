# M4 · 分層架構：把單檔 app 拆成 routes / controllers / services

> 主線章節（spine）。接續 [M3 關聯]——程式功能不變，但我們把擠在一個 `app.js` 裡的所有東西，**沿著責任切成三層**。這是一個「重構」章節：API 行為完全一樣，改變的是程式的組織方式。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：把 M3 那個「所有路由、驗證、DB 查詢全塞在 `app.js`」的 todo app，重構成 `routes → controllers → services` 三層結構，外加 `app.js`／`server.js` 分離與集中式錯誤處理。**重構後 API 行為與 M3 完全一致**——用 M3 那組請求就能驗收。

**搞懂**：
- 先**感受單檔的痛**：一個檔案管太多事，會怎麼變得難讀難改
- **架構光譜**：單檔 → 分層/MVC → 領域導向，以及為什麼本課規模「分層剛好」
- **三層的職責邊界**：route 只指路、controller 只碰 HTTP、service 管業務邏輯與 DB
- 為什麼 `app.js`（組裝）與 `server.js`（啟動）要分開
- 為什麼 controller **沒寫 try/catch** 也能把 service 拋的錯誤變成 400/404/500

---

## ② 前置檢查

- [ ] 完成 [M3 關聯]——`完成版` 跑得起來（`todos` + `lists` + `tags` 都能用）。本章的起點就是 M3 的完成版。
- [ ] 讀過 [概念卡：Express Middleware](../concepts/express-middleware.md) 與 [概念卡：Express 的錯誤處理](../concepts/express-錯誤處理.md)（懂 middleware 順序、`next(err)`、Express 5 的 async 自動轉交）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 里程碑 | 你會做到 | 檢查點 |
|---|---|---|
| 1 | `app.js`（組裝）/ `server.js`（啟動）分離，抽出 `middleware/errorHandler.js` + `lib/httpError.js` | A |
| 2 | 拿 `todos` 當示範，拆成 `routes → controller → service`，**先只拆這一個資源** | B |
| 3 | 同一套模式套用到 `lists`、`tags` | C |
| 4 | 用 `routes/index.js` 匯總掛載，`app.js` 收斂成「組裝 + 掛載」 | D（完成版） |

完成版在 [`完成版/`](./完成版/)。

---

## ④ 概念卡

- [分層架構](../concepts/分層架構.md) — 架構光譜、三層職責邊界、`app.js`/`server.js` 為何分離
- [Express 的錯誤處理](../concepts/express-錯誤處理.md) — 為什麼 controller 不必寫 try/catch（Express 5 async 自動轉交）

---

## ⑤ 驗收 + 挑戰

### 驗收

重構的驗收標準很單純：**行為跟 M3 一模一樣**。用 [M3 的那組請求](../05-relations/README.md#驗收) 跑一遍，結果應該完全相同。

```bash
cd 完成版
npm install
cp .env.example .env        # 改成你的 todo_app 連線字串
npm run generate
npm run migrate
npm run dev
```

確認（與 M3 等價）：

- [ ] `GET /todos` 每筆都帶 `list` 物件與 `tags` 陣列
- [ ] `POST /todos`、`POST /lists`、`POST /tags` 都能建立；帶不存在的 `listId` 回 400
- [ ] `POST /todos/:id/tags` 能貼標籤、`DELETE /todos/:id/tags/:tagId` 能撕
- [ ] `GET /todos/99999`（不存在）回 404；少 `title` 的 `POST /todos` 回 400

> 重點不是「有沒有多開資料夾」，而是**每一層只碰自己該碰的東西**：打開 `controller` 看不到 SQL，打開 `service` 看不到 `req`/`res`。

### 挑戰（可選）

1. **把 `shapeTodo` 升級成獨立 serializer**：目前 `shapeTodo` 藏在 `todos.service.js` 裡。把「資料 → 對外格式」這件事抽成獨立一層（例如 `serializers/todo.serializer.js`），讓 service 回傳乾淨的 domain 資料、由 serializer 決定對外長相。想想這條邊界讓什麼變好測。

2. **`GET /todos/abc` 該回 400 還是 404？**：目前傳非數字 id（如 `/todos/abc`），`Number('abc')` 會變成 `NaN`，查不到 → 回 404「找不到這筆 todo」。語意上「格式錯誤」更像 400。思考：要不要在 service 加 id 型別驗證（`NaN` → 拋 `HttpError(400, ...)`）？加了之後，**還跟 M3 等價嗎**？（M3 同樣是 `Number()` 後查不到回 404——若你改成 400，就**不再**與 M3 完全等價了。這是一個「正確性 vs 等價性」的取捨，值得想清楚再決定。）

---

**下一章 → [M5 · Cookie / Session：加上會員登入]**（有了乾淨的分層，加 auth middleware 與「我的 todo」邏輯會輕鬆很多）
