# 第 12 堂 · Prisma 關聯與整合：清單與標籤

> 對應課綱第 12 堂（relations、進階查詢、接進 Express API）。延續第 11 堂的 Prisma 版 todo app。

> ⚠️ 第 9–12 堂是新主題，**先不用 AI 工具**。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：在 todo app 加上清單（1:N）和標籤（M:N），API 回傳 todo 時連同清單和標籤一起帶出，並能替 todo 貼標籤、撕標籤。

**搞懂**：
- `schema.prisma` 怎麼描述 1:N 和 M:N，外鍵欄位和關聯欄位的差別
- `include` 怎麼一次撈出關聯資料
- `onDelete: SetNull` 和 `onDelete: Cascade` 的實際效果
- 巢狀資源的網址設計（`/todos/:id/tags`）
- 409 Conflict 什麼時候用、400 和 404 怎麼區分

---

## ② 前置檢查

- [ ] 完成[第 11 堂](../11-prisma-basics/)，手上有接好 PostgreSQL 的 todo app（或直接複製[第 11 堂完成版](../11-prisma-basics/完成版/)，照它的 README 設定好資料庫）。
- [ ] 記得[第 9 堂](../09-postgresql-basics/)的 `lists`、`tags`、`todo_tags` 三張表怎麼關聯。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–2 | 寫 API 對照表、在 schema 加上關聯、產生 migration | A |
| 3 | 清單與標籤的三層 | B |
| 4 | todo 帶出清單和標籤 | C |
| 5 | 貼標籤、撕標籤 | D |
| 6 | 驗證關聯的刪除規則 | E（完成版） |

完成版放在 [`完成版/`](./完成版/)。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [Prisma 關聯查詢](../concepts/prisma-關聯查詢.md)：schema 裡的關聯怎麼寫、`include` 怎麼用
- [SQL 關聯與 JOIN](../concepts/sql-關聯與join.md)：關聯在資料庫層面的樣子
- [migration](../concepts/migration.md)：在既有資料表上加欄位的 migration

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試[課堂練習](./課堂練習.md)：自己做「依標籤篩選 todo」和「每個清單有幾筆 todo」。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm install
cp .env.example .env              # 再把 DATABASE_URL 改成你的資料庫
npx prisma migrate dev            # 套用 init 和 add_lists_and_tags 兩個 migration
npm run dev
```

逐一確認：

- [ ] `POST /lists` 建一個清單，在這個清單下 `POST /todos`（帶 `listId`），`GET /lists/:id` 的 `todos` 看得到它
- [ ] `POST /tags` 建一個標籤，`POST /todos/:id/tags` 貼上後，`GET /todos/:id` 的回應同時有 `list` 和 `tags`
- [ ] 同名標籤新增第二次回 409
- [ ] `DELETE /todos/:id/tags/:tagId` 回 204，再撕一次回 404
- [ ] 刪除清單後，原本在清單裡的 todo 還在，`list` 變成 `null`

### 挑戰（可選，加深理解）

1. **一次換掉所有標籤**：做一個 `PUT /todos/:id/tags`，body 是 `{ "tagIds": [1, 3] }`，把 todo 的標籤**整組換掉**。先刪光舊的、再新增新的，這兩步要用 `prisma.$transaction` 包起來，想想為什麼。（→ [概念卡：SQL 交易](../concepts/sql-交易.md)）
2. **隱式多對多**：開一個新的練習專案，用 Prisma 的隱式多對多（不寫 `TodoTag`）做一樣的功能，比較 schema、查詢和產生的 migration 差在哪。
3. **select vs include**：讓 `GET /lists` 回傳每個清單時，只帶出底下 todo 的 `id` 和 `title`。

---

**下一堂 → [第 13 堂 · 綜合實作專案](../13-final-project/)**
