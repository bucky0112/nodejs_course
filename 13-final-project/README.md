# 第 13 堂 · 綜合實作專案：規則、測試與 AI 協作

> 對應課綱第 13 堂（RESTful API + PG / Prisma 全整合與驗收）。延續第 12 堂的 todo app，把測試、規則檔和資料層接在一起。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：
- 連測試資料庫的測試，每個測試從乾淨的資料庫開始
- 加上資料層規則的 `AGENTS.md`
- 和 AI 協作完成的「優先順序」功能（含 migration 和測試），以及一份審查表

**搞懂**：
- 為什麼測試要用獨立的資料庫，怎麼讓每個測試互不影響
- `prisma migrate deploy` 和 `migrate dev` 的差別
- 審查 AI 產出的 schema 與 migration 要看什麼
- 這門課的完整工作方式：先學會 → 寫成規則與測試 → 交代需求 → 審查、測試、能解釋才採納

---

## ② 前置檢查

- [ ] 完成[第 12 堂](../12-prisma-relations-integration/)，手上有清單和標籤的 Prisma 版 todo app（或直接複製[第 12 堂完成版](../12-prisma-relations-integration/完成版/)）。
- [ ] 手上有第 8 堂的 `AGENTS.md`、`CLAUDE.md`、`tests/`（第 11 堂收起來的那些）。
- [ ] 能用的 AI 開發工具（第 7 堂用的那一個）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–2 | 建立測試資料庫、讓測試自動用它 | A |
| 3 | 改寫測試，每個測試自己準備資料 | B |
| 4 | 規則檔加上資料層規則 | C |
| 5 | 請 AI 加上「優先順序」功能 | D |
| 6 | 審查 schema、migration、程式碼與測試 | E |
| 7 | 全部驗證一次 | F（完成版） |

完成版放在 [`完成版/`](./完成版/)。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [migration](../concepts/migration.md)：`migrate dev` 和 `migrate deploy` 的差別、為什麼不能改舊的 migration
- [Prisma 關聯查詢](../concepts/prisma-關聯查詢.md)
- [分層架構](../concepts/分層架構.md)

---

## ⑤ 驗收 + 綜合專案

> ✏️ **綜合專案**：做完工作坊後，用同樣的方式完成[綜合專案](./課堂練習.md)。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm install
cp .env.example .env              # 改成你的開發資料庫
cp .env.test.example .env.test    # 改成你的測試資料庫
createdb todo_app
createdb todo_app_test
npx prisma migrate dev            # 套用三個 migration 到開發資料庫
npm test                          # 會自動套用 migration 到測試資料庫
npm run dev
```

逐一確認：

- [ ] `npm test` 全部通過，結束碼是 0
- [ ] 在 `todo_app` 手動新增的資料，跑完 `npm test` 後還在
- [ ] `POST /todos` 帶 `{"title":"buy milk"}` 回 201、`priority` 是 `medium`，接著 `GET /todos` 看得到它
- [ ] `GET /todos?priority=urgent` 回 400
- [ ] 第 11、12 堂的驗收清單照樣通過
- [ ] `AGENTS.md` 有「資料層」規則，你的審查表每一列都有決定和理由

---

## 這門課接下來

你現在手上的 todo app 有分層架構、錯誤處理、測試、PostgreSQL 與 Prisma。想繼續延伸，可以試試：

- 會員登入：每個人只看得到自己的 todo
- 部署：把 app 和資料庫放上雲端

這些主題在《Next.js 全端開發》等後續課程會碰到。這個 repo 的舊版（[`v1-drizzle` tag](https://github.com/bucky0112/nodejs_course/tree/v1-drizzle)）也有 Session、JWT、OAuth、S3 上傳、部署和 Docker 的章節可以參考，只是資料層用的是 Drizzle，不是 Prisma。
