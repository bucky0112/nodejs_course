# Node.js + Express 後端開發實戰：範例程式碼

這是《Node.js + Express 後端開發實戰（含 PostgreSQL + Prisma）》課程的範例 repo，13 個資料夾對應課程的 13 堂。你會**一路把同一個 todo app 養大**：從原生 http 伺服器開始，換成 Express、加上 middleware 與錯誤處理、整理成三層架構、寫測試，再接上 PostgreSQL 與 Prisma。

> 🗂️ 舊版內容（Drizzle 版，含 Session、JWT、OAuth、S3 上傳、Supabase、Railway 部署、Docker 章節）保存在 [`v1-drizzle` tag](https://github.com/bucky0112/nodejs_course/tree/v1-drizzle)。

---

## 每一堂長什麼樣

每一堂的資料夾都有：

| 檔案 | 內容 |
|---|---|
| `README.md` | 這堂會做出什麼、前置檢查、驗收清單與挑戰題 |
| `工作坊.md` | 跟著做的步驟，每個里程碑有一個檢查點 |
| `課堂練習.md` | 沒有逐步指引、自己寫的練習 |
| `完成版/` | 這堂結束時的程式碼，卡關時可以比對 |

`concepts/` 是概念卡：短、獨立的「為什麼」說明，工作坊會在對應的步驟連過去，課後也能單獨複習。

---

## 課程地圖

| 堂次 | 資料夾 | 你會做到 |
|---|---|---|
| 1 | [Node.js 核心概念與環境](./01-nodejs-core-and-modules/) | ESM 與 CommonJS、npm、內建模組、原生 http 伺服器 |
| 2 | [非同步處理與事件迴圈](./02-async-and-event-loop/) | callback / Promise / async-await、事件迴圈的執行順序 |
| 3 | [Express 入門與路由設計](./03-express-basics-and-routing/) | todo app 起點：路由、`req.params` / `query` / `body` |
| 4 | [Middleware 應用](./04-middleware/) | 內建、第三方（morgan）、自訂與路由層級 middleware |
| 5 | [RESTful API 設計](./05-restful-api-design/) | 完整 CRUD、狀態碼、PUT vs PATCH、API 對照表 |
| 6 | [錯誤處理機制](./06-error-handling/) | 錯誤處理 middleware、`HttpError`、拆成 routes / controllers / services |
| 7 | [AI 輔助生成 API 架構](./07-ai-assisted-api-scaffolding/) | 把規則寫成 `AGENTS.md`，請 AI 產生 `/notes`，自己審查 |
| 8 | [測試與驗證 API](./08-testing-and-validation/) | vitest + supertest，審查 AI 寫的測試 |
| 9 | [PostgreSQL 基礎](./09-postgresql-basics/) | 關聯模型、SQL CRUD、JOIN |
| 10 | [PostgreSQL 進階](./10-postgresql-advanced/) | 交易、index 與 EXPLAIN、正規化、psql |
| 11 | [Prisma 入門](./11-prisma-basics/) | schema.prisma、migration，把 todo 存進資料庫 |
| 12 | [Prisma 關聯與整合](./12-prisma-relations-integration/) | 清單（1:N）、標籤（M:N）、`include` |
| 13 | [綜合實作專案](./13-final-project/) | 測試資料庫、資料層規則，和 AI 一起完成新功能 |

### todo app 的成長弧

```
第 1 堂   原生 http       → 感受沒有框架有多囉嗦
第 3 堂   Express         → 記憶體 todo：列表、單筆、新增
第 4 堂   middleware      → morgan、驗證、404
第 5 堂   RESTful         → 補上 PATCH、DELETE
第 6 堂   錯誤處理        → 統一錯誤出口，拆成三層
第 7 堂   AI 產生 /notes  → 規則檔 + 審查
第 8 堂   測試            → npm test 一鍵驗證
第 11 堂  Prisma          → todo 存進 PostgreSQL（只改 service）
第 12 堂  關聯            → 清單與標籤
第 13 堂  全整合          → 測試資料庫、資料層規則、和 AI 加功能
```

第 2、9、10 堂不改 todo app，分別打好非同步和 SQL 的基礎。

---

## 這門課怎麼用 AI

AI 是**放大器**：你的基礎越好，越能用好 AI；還看不懂程式碼時就用 AI，放大的是錯誤。

| 堂次 | AI 的角色 |
|---|---|
| 1–6 | 不用 AI，先建立判斷程式碼對不對的能力 |
| 7–8 | 把前 6 堂的規則寫成規則檔，請 AI 產生程式碼與測試，自己審查 |
| 9–12 | 新主題（SQL、Prisma），先不用 AI，親手學會 |
| 13 | 把資料層規則加進規則檔，再和 AI 協作 |

**AI 產生的程式碼，你能解釋才採納。**

---

## 概念卡索引

**Node / Express**
- [ESM vs CommonJS](./concepts/esm-vs-cjs.md) · [Node.js 的非同步機制](./concepts/非同步機制.md)
- [Express Middleware](./concepts/express-middleware.md) · [HTTP 狀態碼](./concepts/http-狀態碼.md) · [Express 的錯誤處理](./concepts/express-錯誤處理.md)
- [分層架構](./concepts/分層架構.md)

**資料庫**
- [SQL 關聯與 JOIN](./concepts/sql-關聯與join.md) · [SQL 交易](./concepts/sql-交易.md)
- [ORM 是什麼](./concepts/orm-是什麼.md) · [migration](./concepts/migration.md) · [Prisma 關聯查詢](./concepts/prisma-關聯查詢.md)

**環境 / 工具**
- [Windows 指令對照](./concepts/windows-指令對照.md)（Windows 使用者必看）

---

## 技術棧

- **Runtime**：Node.js 22.18 以上（全程 ESM）
- **框架**：Express 5
- **測試**：vitest + supertest
- **資料庫**：PostgreSQL
- **ORM**：Prisma 7

---

## 環境需求

- **Node.js 22.18 以上**（`node -v` 確認；建議用 [nvm](https://github.com/nvm-sh/nvm) 管理版本）
- **PostgreSQL 16 以上**（第 9 堂起需要；本機安裝或用 Docker 都可以）
- 一個能打 API 的工具：VS Code REST Client、Postman，或終端機的 `curl`
- 第 7 堂起：一個能讀寫專案檔案的 AI 開發工具（例如 Claude Code、Codex、GitHub Copilot 的 agent 模式）

> 🪟 **Windows 使用者**：課程指令以 macOS / Linux（bash）為基準，有幾個地方（`curl`、`cp`、`psql`）在 Windows 寫法不同。開課前先看 [Windows 指令對照](./concepts/windows-指令對照.md)。

## 快速開始

```bash
# 從第 1 堂開始：讀 README.md，跟著 工作坊.md 動手做
cd 01-nodejs-core-and-modules

# 想直接跑某一堂的成果，進它的 完成版/（第 11 堂起要先設定資料庫，見該堂 README）
cd 06-error-handling/完成版
npm install
npm run dev
```
