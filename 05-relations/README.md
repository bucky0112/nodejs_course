# M3 · 關聯：幫 todo 加上清單與標籤

> 主線章節（spine）。接續 [M2]——把單一張 `todos` 表，長成有「清單分類」(1:N) 和「標籤」(M:N) 的關聯式資料模型。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：todo 可以歸到某個清單、可以貼多個標籤。`GET /todos` 會一次回傳每筆 todo 連同它的清單與標籤。

**搞懂**：
- 一對多（1:N）、多對多（M:N）在 Drizzle 怎麼定義
- 中介表（junction table）與複合主鍵
- 用 `relations()` + Query API 撈關聯資料
- 為什麼撕一個 M:N 關聯要「兩個欄位都比對」

---

## ② 前置檢查

- [ ] 完成 [M2]（todo app 已接上 Drizzle + PostgreSQL）。
- [ ] 讀過 [概念卡：SQL 關聯與 JOIN](../concepts/sql-關聯與join.md)（懂 1:N / M:N / 外鍵的資料庫概念）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 1 | schema 加 lists、tags、todo_tags + 外鍵 | A |
| 2 | 定義 Drizzle relations、產生 migration | B |
| 3 | 清單 / 標籤的 CRUD 路由 | C |
| 4 | 貼/撕標籤、用 Query API 撈關聯 | D（完成版） |

完成版在 [`完成版/`](./完成版/)。

---

## ④ 概念卡

- [SQL 關聯與 JOIN](../concepts/sql-關聯與join.md) — 資料庫層面的 1:N、M:N、外鍵
- [Drizzle 的關聯查詢](../concepts/drizzle-關聯查詢.md) — `relations()`、Query API、穿過中介表

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試 [課堂練習](./課堂練習.md)——不看程式碼、自己從零定義一組新的 M:N 關聯（清單↔成員），用 `relations()` + `with` 查出來。練的是「能不能獨立寫出來」，跟下面的挑戰（延伸既有關聯）分工。

### 驗收

```bash
cd 完成版
npm install
cp .env.example .env        # 改成你的 todo_app 連線字串
npm run generate
npm run migrate
npm run dev
```

確認：

- [ ] `POST /lists`、`POST /tags` 能建立清單與標籤
- [ ] `POST /todos` 帶 `listId` 能把 todo 歸到清單；帶不存在的 listId 回 400
- [ ] `POST /todos/:id/tags` 能貼標籤、`DELETE /todos/:id/tags/:tagId` 能撕（且只撕掉指定那一個）
- [ ] `GET /todos` 每筆都帶 `list` 物件與 `tags` 陣列

### 挑戰（可選）

1. 加 `GET /lists/:id/todos`：列出某清單底下的所有 todo（用 Query API 的 `with: { todos: true }`）。
2. 加 `GET /todos?tag=緊急`：只回傳貼了某標籤的 todo。
3. 用 `select` + `leftJoin` + `groupBy` 做一個 `GET /stats`：每個清單有幾筆 todo（含 0 筆的空清單）。

---

**下一章 → [M4 · 分層架構：把單檔 app 拆成 routes / controllers / services]**（先把程式整理乾淨，後面加會員登入會輕鬆很多）
