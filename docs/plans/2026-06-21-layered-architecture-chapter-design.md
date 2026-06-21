# 新增「分層架構」章節 + 後續章節分層化 — 設計文件

**日期**：2026-06-21
**狀態**：設計定稿，待實作
**動機**：第 5 章起所有邏輯都塞進單一 `app.js`（路由＋驗證＋業務邏輯＋DB 存取四職一身），逐章膨脹（200→250→222→302→346 行），且大量程式碼跨章逐字複製。全課從未教過分層，學員結業作品是一支數百行的 `app.js`。

---

## 核心決定

| 項目 | 決定 |
|---|---|
| 形式 | 新增一個**獨立章節**專門教架構化（為什麼要分層 → 有哪些架構 → 動手拆），之後章節都照分層模式開發 |
| 位置 | 插在第 5 章（關聯）之後、原第 6 章（session）之前 |
| 身分 | 主線（spine）milestone，非側模組（後面每章都依賴它） |
| 分層深度 | 三層：`routes / controllers / services`，service 直接用 Drizzle 打 DB（**不**加 repository 層，YAGNI） |
| 貫穿範圍 | 改寫主線 4 章（session / JWT / OAuth / 上傳）+ Docker 跟齊；Supabase、Railway 無 CRUD app 不受影響 |
| 架構 survey | 光譜式短講 + 一張概念卡（單檔 → 分層/MVC → Clean/Hexagonal 點到為止），主體是動手重構 |
| 驗證 | 以程式碼審視為主；本機 PostgreSQL 由作者自行實跑驗證行為等價 |

---

## 編號連動

插入後資料夾順移、主線 M 編號於 M4 之後整體 +1：

| 現在 | 變成 | 章節 |
|---|---|---|
| —  | **06** | **M4 · 分層架構（新增）** |
| 06 | 07 | M5 · Cookie/Session |
| 07 | 08 | M6 · JWT |
| 08 | 09 | M7 · OAuth |
| 09 | 10 | M8 · 檔案上傳 |
| 10 | 11 | S2 · Supabase |
| 11 | 12 | M9 · Railway 部署 |
| 12 | 13 | S3 · Docker |

---

## 目標分層結構

```
src/
  app.js            建立 express app、掛全域 middleware、掛 routes、掛錯誤處理（不含 listen）
  server.js         import app 後 app.listen（組裝與啟動分離，利於測試）
  routes/           每個資源一個 Express Router，只宣告「路徑 → controller」
    index.js        匯總掛載各 resource router
    todos.routes.js  lists.routes.js  tags.routes.js
  controllers/      只負責 HTTP：讀 req、呼叫 service、決定狀態碼與回應
    todos.controller.js  lists.controller.js  tags.controller.js
  services/         業務邏輯 + 直接用 Drizzle 打 DB（驗證、ownership、組資料）
    todos.service.js  lists.service.js  tags.service.js
  middleware/
    errorHandler.js   收斂每章重複的 404 + error handler
  db/  index.js  schema.js（維持不變）
```

職責邊界：
- **route**：只綁路徑與 middleware → controller，零邏輯。
- **controller**：只碰 HTTP（req/res/status），不直接打 DB。
- **service**：業務邏輯與 DB 存取，回傳純資料/拋錯，不認識 req/res。

---

## 新章 06 內容（五段式）

1. **這章你會做出什麼**：感受單檔的痛 → 認識架構光譜 → 把 todo app 拆三層。
2. **前置檢查**：銜接第 5 章關聯 `完成版`（todos + lists + tags 可跑）。
3. **工作坊**（起點＝第 5 章完成版，終點＝功能不變的三層版）：
   - 里程碑 1：`app.js`/`server.js` 拆分 + 抽 `middleware/errorHandler.js`，確認仍可跑。
   - 里程碑 2：以 `todos` 為示範拆成 `routes → controller → service`，先驗證單一資源。
   - 里程碑 3：同模式套用到 `lists`、`tags`。
   - 里程碑 4：`routes/index.js` 匯總掛載，`app.js` 收斂成「組裝 + 掛載」。
4. **概念卡**：新增 `concepts/分層架構.md`（架構光譜 + 三層職責）。
5. **驗收 + 挑戰**：API 行為與第 5 章完全一致；挑戰例如把 `shapeTodo` 升級成獨立 serializer。

**關鍵原則**：重構後 API 行為零變化，用第 5 章原有的請求即可驗收沒改壞。

---

## 後續章節新功能落點

| 章 | 新功能 | 落層 |
|---|---|---|
| 07 Session | 註冊/登入/登出/me、todo 綁 user | 新增 `auth.*`、`requireAuth`；`todos.service` 加 ownership |
| 08 JWT | session 換 token | 改 `auth.service`（簽/驗 token）、`requireAuth`；**其餘層幾乎不動** ← 分層價值高潮 |
| 09 OAuth | Google 登入 | `auth.service` 加 OAuth 流程、`auth.routes` 加 `/auth/google*`；todo 層不動 |
| 10 上傳 | 頭像上傳 S3 | 新增 `me.routes/controller`、`avatar.service`、`config/s3.js`、multer middleware；`errorHandler` 加 multer 分支 |
| 13 Docker | 容器化 | 同一套分層 app + Dockerfile/compose |

跨章重複的 `loadOwnedTodo` / `shapeTodo` / 整組 CRUD handler，收進對應 service 後不再逐字複製。

---

## 實作順序（小步可驗證）

1. **先做新章 06 完成版**（拆第 5 章 app 成三層）→ 行為對齊第 5 章。此為樣板，定稿後其餘有依據。
2. 寫新章 06 `工作坊.md` + 概念卡。
3. 資料夾順移（git mv）+ 全域連結／編號更新，一次做完避免半新半舊。
4. 逐章改寫 07→08→09→10→13 完成版（每章審視行為等價）再改其工作坊。
5. 收尾：根 `README.md` 課程地圖＋成長弧、概念卡索引、memory。

## 連帶更新清單

- 根 `README.md`：課程地圖表、成長弧、最短完課路徑、概念卡索引。
- 各章 README 的「前置檢查／前一章／下一章」交叉連結與 M/S 標籤。
- 07–10、13 的 `工作坊.md`：步驟由「塞 app.js」改為「放進對應層」。
- memory `course-workshop-refactor.md`：章節數與進度。
