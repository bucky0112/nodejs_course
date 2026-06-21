# 分層架構章節 + 後續章節分層化 實作計畫

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 新增一個教「分層架構」的主線章節（新 06），把第 5 章的單檔 todo app 重構成 routes/controllers/services 三層，並將其後主線 4 章（session/JWT/OAuth/上傳）與 Docker 章一併改寫為同一套分層結構。

**Architecture:** 三層 — `routes`（路徑→controller）/`controllers`（只碰 HTTP）/`services`（業務邏輯+Drizzle 直接打 DB）。service 拋 `HttpError`，由 `middleware/errorHandler.js` 統一翻成回應；express 5 自動轉送 async rejection，controller 維持精簡。`app.js`（組裝）與 `server.js`（啟動）分離。**重構後 API 行為與第 5 章完全一致**，以此為驗收基準。

**Tech Stack:** Node.js ≥22、ESM、Express 5、Drizzle ORM (node-postgres)、PostgreSQL。無自動化測試 → 驗收＝程式碼審視行為等價 +（作者本機）手動 API 請求。

**設計來源：** `docs/plans/2026-06-21-layered-architecture-chapter-design.md`

---

## 慣例與注意事項（每個 task 都適用）

- **目錄結構**：所有 app 程式碼移到 `src/` 下（含 `app.js`、`server.js`）。`drizzle.config.js` 留在 `完成版/` 根（它已指向 `./src/db/schema.js`，不動）。
- **進入點**：`src/server.js`。`import 'dotenv/config'` 放在 `src/app.js` 最上方（早於任何 import db 的模組），確保 `DATABASE_URL` 在 `new Pool()` 前已載入。
- **package.json**：`main` → `src/server.js`；`scripts.dev` → `node --watch src/server.js`；`scripts.start` → `node src/server.js`。version bump（06 → 0.4.0，後續遞增）。
- **errorHandler 必須 4 個參數** `(err, req, res, next)`，否則 express 不認得它是錯誤中介。
- **驗收**：每章完成後，與改寫前的 `app.js` 逐路由比對「相同輸入 → 相同狀態碼 + 相同 JSON 形狀」。本機實跑由作者執行（`npm install && npm run dev` + 代表性請求）。
- **commit**：每個 task 結束時 commit（訊息說明 why）。先在分支作業，最後開 PR。

---

## Phase 0：分支準備

### Task 0.1：開工作分支
**Step 1:** 從 main 開分支。
```bash
git checkout -b feat/layered-architecture-chapter
```
**Step 2:** 確認 `git status` 乾淨（`docs/` 兩份計畫文件可先 commit）。
```bash
git add docs/plans/2026-06-21-layered-architecture-chapter*.md
git commit -m "docs: 分層架構章節設計與實作計畫"
```

---

## Phase 1：新章 06 完成版（樣板，最高優先）

目標：在 `06-architecture/完成版/` 產出第 5 章 todo app 的三層版本。**此為全案樣板，定稿後其餘章節照抄結構。**

### Task 1.1：複製第 5 章完成版為新章基底
**Files:** Create `06-architecture/完成版/`（由 05 複製）

**Step 1:** 複製整個第 5 章完成版（含 drizzle/、package.json、.env.example、.gitignore），作為起點。
```bash
mkdir -p 06-architecture
cp -R 05-relations/完成版 06-architecture/完成版
rm -rf 06-architecture/完成版/node_modules 06-architecture/完成版/package-lock.json
```
**Step 2:** 確認 `06-architecture/完成版/app.js` 與 `src/db/` 在位（接下來會把 app.js 拆掉）。

### Task 1.2：建立 errorHandler 與 HttpError
**Files:**
- Create `06-architecture/完成版/src/lib/httpError.js`
- Create `06-architecture/完成版/src/middleware/errorHandler.js`

> 註：相對設計文件的樹，多了 `src/lib/httpError.js`（放帶狀態碼的錯誤類別）。這是讓 service 能「拋出帶 HTTP 狀態的錯誤、由 errorHandler 統一處理」的最小必要件。

`src/lib/httpError.js`：
```js
// 帶 HTTP 狀態碼的錯誤：service 拋出後，由 errorHandler 統一翻成回應。
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
```

`src/middleware/errorHandler.js`：
```js
// 沒有任何路由命中 → 404
export function notFound(req, res) {
  res.status(404).json({ error: `找不到路徑 ${req.method} ${req.originalUrl}` })
}

// 全域錯誤出口：service 拋的 HttpError 帶 status；其餘視為 500。
// 必須是 4 個參數，express 才認得這是錯誤處理 middleware。
export function errorHandler(err, req, res, next) {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || '伺服器發生錯誤' })
}
```

### Task 1.3：todos 三層
**Files:**
- Create `06-architecture/完成版/src/services/todos.service.js`
- Create `06-architecture/完成版/src/controllers/todos.controller.js`
- Create `06-architecture/完成版/src/routes/todos.routes.js`

`src/services/todos.service.js`：
```js
import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { todos, lists, tags, todoTags } from '../db/schema.js'
import { HttpError } from '../lib/httpError.js'

// 把 Query API 撈出來的 todo 整理成乾淨格式：todoTags:[{tag}] → tags:[tag]
function shapeTodo(todo) {
  const { todoTags: links, ...rest } = todo
  return { ...rest, tags: (links ?? []).map((l) => l.tag) }
}

export async function listTodos() {
  const rows = await db.query.todos.findMany({
    with: { list: true, todoTags: { with: { tag: true } } },
    orderBy: asc(todos.id),
  })
  return rows.map(shapeTodo)
}

export async function getTodo(id) {
  const todo = await db.query.todos.findFirst({
    where: eq(todos.id, id),
    with: { list: true, todoTags: { with: { tag: true } } },
  })
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  return shapeTodo(todo)
}

export async function createTodo({ title, listId }) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new HttpError(400, 'title 必填，且必須是非空字串')
  }
  if (listId !== undefined && listId !== null) {
    const list = await db.query.lists.findFirst({ where: eq(lists.id, Number(listId)) })
    if (!list) throw new HttpError(400, '指定的 listId 不存在')
  }
  const [todo] = await db
    .insert(todos)
    .values({ title: title.trim(), listId: listId ?? null })
    .returning()
  return todo
}

export async function updateTodo(id, { title, completed, listId }) {
  const fields = {}
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new HttpError(400, 'title 必須是非空字串')
    }
    fields.title = title.trim()
  }
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      throw new HttpError(400, 'completed 必須是布林值')
    }
    fields.completed = completed
  }
  if (listId !== undefined) {
    if (listId !== null) {
      const list = await db.query.lists.findFirst({ where: eq(lists.id, Number(listId)) })
      if (!list) throw new HttpError(400, '指定的 listId 不存在')
    }
    fields.listId = listId
  }
  if (Object.keys(fields).length === 0) {
    throw new HttpError(400, '沒有提供要更新的欄位')
  }
  const [todo] = await db.update(todos).set(fields).where(eq(todos.id, id)).returning()
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  return todo
}

export async function deleteTodo(id) {
  const [deleted] = await db.delete(todos).where(eq(todos.id, id)).returning()
  if (!deleted) throw new HttpError(404, '找不到這筆 todo')
}

export async function addTagToTodo(todoId, tagId) {
  const todo = await db.query.todos.findFirst({ where: eq(todos.id, todoId) })
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  const tag = await db.query.tags.findFirst({ where: eq(tags.id, Number(tagId)) })
  if (!tag) throw new HttpError(404, '找不到這個標籤')
  await db.insert(todoTags).values({ todoId, tagId: Number(tagId) }).onConflictDoNothing()
  return { todoId, tagId: Number(tagId) }
}

export async function removeTagFromTodo(todoId, tagId) {
  const [removed] = await db
    .delete(todoTags)
    .where(and(eq(todoTags.todoId, todoId), eq(todoTags.tagId, tagId)))
    .returning()
  if (!removed) throw new HttpError(404, '這個 todo 沒有這個標籤')
}
```

`src/controllers/todos.controller.js`：
```js
import * as todosService from '../services/todos.service.js'

export async function list(req, res) {
  res.json(await todosService.listTodos())
}

export async function get(req, res) {
  res.json(await todosService.getTodo(Number(req.params.id)))
}

export async function create(req, res) {
  res.status(201).json(await todosService.createTodo(req.body))
}

export async function update(req, res) {
  res.json(await todosService.updateTodo(Number(req.params.id), req.body))
}

export async function remove(req, res) {
  await todosService.deleteTodo(Number(req.params.id))
  res.status(204).send()
}

export async function addTag(req, res) {
  res.status(201).json(await todosService.addTagToTodo(Number(req.params.id), req.body.tagId))
}

export async function removeTag(req, res) {
  await todosService.removeTagFromTodo(Number(req.params.id), Number(req.params.tagId))
  res.status(204).send()
}
```

`src/routes/todos.routes.js`：
```js
import { Router } from 'express'
import * as todosController from '../controllers/todos.controller.js'

export const todosRouter = Router()

todosRouter.get('/', todosController.list)
todosRouter.get('/:id', todosController.get)
todosRouter.post('/', todosController.create)
todosRouter.patch('/:id', todosController.update)
todosRouter.delete('/:id', todosController.remove)
todosRouter.post('/:id/tags', todosController.addTag)
todosRouter.delete('/:id/tags/:tagId', todosController.removeTag)
```

### Task 1.4：lists 與 tags 三層
**Files:** Create services/controllers/routes ×2（lists、tags），模式同 todos。

`src/services/lists.service.js`：
```js
import { asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { lists } from '../db/schema.js'
import { HttpError } from '../lib/httpError.js'

export async function listLists() {
  return db.select().from(lists).orderBy(asc(lists.id))
}

export async function createList({ name }) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new HttpError(400, 'name 必填')
  }
  const [list] = await db.insert(lists).values({ name: name.trim() }).returning()
  return list
}
```
`src/controllers/lists.controller.js`：
```js
import * as listsService from '../services/lists.service.js'

export async function list(req, res) {
  res.json(await listsService.listLists())
}
export async function create(req, res) {
  res.status(201).json(await listsService.createList(req.body))
}
```
`src/routes/lists.routes.js`：
```js
import { Router } from 'express'
import * as listsController from '../controllers/lists.controller.js'

export const listsRouter = Router()
listsRouter.get('/', listsController.list)
listsRouter.post('/', listsController.create)
```
`tags.*` 三檔同形（把 lists 換成 tags、schema 用 `tags`）。

### Task 1.5：routes 匯總、app.js、server.js、package.json、刪舊 app.js
**Files:**
- Create `06-architecture/完成版/src/routes/index.js`
- Create `06-architecture/完成版/src/app.js`
- Create `06-architecture/完成版/src/server.js`
- Modify `06-architecture/完成版/package.json`
- Delete `06-architecture/完成版/app.js`

`src/routes/index.js`：
```js
import { Router } from 'express'
import { todosRouter } from './todos.routes.js'
import { listsRouter } from './lists.routes.js'
import { tagsRouter } from './tags.routes.js'

export const routes = Router()
routes.use('/todos', todosRouter)
routes.use('/lists', listsRouter)
routes.use('/tags', tagsRouter)
```
`src/app.js`：
```js
import 'dotenv/config' // 必須最先載入，讓 db 連線拿得到 DATABASE_URL
import express from 'express'
import { routes } from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export const app = express()

app.use(express.json())

// 請求紀錄
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

app.use(routes)

app.use(notFound)
app.use(errorHandler)
```
`src/server.js`：
```js
import { app } from './app.js'

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`伺服器啟動：http://localhost:${PORT}`)
})
```
`package.json` 改 `main`/`dev`/`start` 指向 `src/server.js`、version `0.4.0`。
刪除舊的 `06-architecture/完成版/app.js`。

### Task 1.6：審視行為等價 + commit
**Step 1:** 逐路由對照 `05-relations/完成版/app.js`：每個 method+path 的狀態碼、驗證訊息、回應形狀一致。檢查清單：`GET/POST/PATCH/DELETE /todos`、`/todos/:id`、`/todos/:id/tags(/:tagId)`、`GET/POST /lists`、`GET/POST /tags`、404、500。
**Step 2:**（作者本機）`npm install && npm run dev`，跑代表性請求確認。
**Step 3:** Commit。
```bash
git add 06-architecture/完成版
git commit -m "feat(06): 新增分層架構章節完成版（第5章 app 重構為三層）"
```

---

## Phase 2：新章 06 教材

### Task 2.1：概念卡 `concepts/分層架構.md`
**Files:** Create `concepts/分層架構.md`
內容：架構光譜（單檔 → 分層/MVC → Clean/Hexagonal，誠實標示本課用分層、過度設計是負擔）+ 三層職責邊界表（route 零邏輯 / controller 只碰 HTTP / service 業務+DB）+「為什麼要 app.js/server.js 分離」。風格對齊既有概念卡（短、獨立、可單獨複習）。

### Task 2.2：`06-architecture/README.md`（五段式總覽）
**Files:** Create `06-architecture/README.md`
依模板：這章做什麼/搞懂什麼、前置檢查（銜接第5章關聯完成版）、工作坊連結、概念卡連結（→ `分層架構.md`）、驗收+挑戰（行為等價、shapeTodo 升級為 serializer）。標籤 `M4 · 分層架構`。

### Task 2.3：`06-architecture/工作坊.md`（動手步驟）
**Files:** Create `06-architecture/工作坊.md`
四里程碑：(1) app.js/server.js 拆 + errorHandler 抽出，(2) todos 拆 routes→controller→service 並驗證單一資源，(3) 套用到 lists/tags，(4) routes/index.js 匯總。每里程碑一檢查點，旁註連結指向概念卡。對齊既有章節 `工作坊.md` 文體。

### Task 2.4：commit
```bash
git add 06-architecture concepts/分層架構.md
git commit -m "docs(06): 分層架構章節 README/工作坊/概念卡"
```

---

## Phase 3：資料夾順移 + 全域編號/連結

### Task 3.1：git mv 順移 06→07 … 12→13
**Step 1:** 由高往低搬，避免名稱衝突。
```bash
git mv 12-docker 13-docker
git mv 11-railway-deploy 12-railway-deploy
git mv 10-supabase 11-supabase
git mv 09-upload-to-s3 10-upload-to-s3
git mv 08-oauth 09-oauth
git mv 07-jwt 08-jwt
git mv 06-cookie-session 07-cookie-session
```
**Step 2:** 確認 `06-architecture` 就位，序列 01–13 連續無洞。

### Task 3.2：更新各章交叉連結與 M/S 標籤
**Files:** Modify 每章 `README.md`、`工作坊.md` 內的「前一章/下一章/前置檢查」相對連結與里程碑標籤。
- 主線 M 標籤 M4 之後 +1：session M4→M5、JWT M5→M6、OAuth M6→M7、上傳 M7→M8、Railway M8→M9。
- 用 grep 找出所有舊路徑/標籤殘留：
```bash
grep -rn "0[6-9]-\|1[0-2]-\|M[4-8]\b" --include=*.md 07-cookie-session 08-jwt 09-oauth 10-upload-to-s3 11-supabase 12-railway-deploy 13-docker
```
逐一核對修正（含 `前置檢查` 指向的前一章編號）。

### Task 3.3：commit
```bash
git add -A
git commit -m "refactor: 章節順移 06→07…12→13，更新交叉連結與 M/S 編號"
```

---

## Phase 4：改寫 07 Cookie/Session 完成版

起點＝Phase 1 三層樣板 + 第 5→6 章 session 差異（見 `06-cookie-session/完成版/app.js` 原始）。

### Task 4.1：搬入分層骨架
**Step 1:** 把 06 樣板的 `src/{app.js,server.js,routes,controllers,services,middleware,lib}` 結構帶進 `07-cookie-session/完成版/src/`（todos/lists/tags 三層照抄）。保留該章既有 `src/middleware/requireAuth.js`、`src/db`。刪除舊 `app.js`，改 package.json 進入點。

### Task 4.2：auth 三層 + session 接線
**Files:** Create `src/services/auth.service.js`、`src/controllers/auth.controller.js`、`src/routes/auth.routes.js`
- `auth.service`：`register`、`login`、`me`（bcrypt 雜湊/比對、username 規則、重複檢查；回傳 user 或拋 HttpError）。**不碰 session**（session 屬 HTTP 狀態，放 controller）。
- `auth.controller`：呼叫 service 後寫 `req.session.userId`（register/login）、`req.session.destroy`（logout）、`req.session.userId` 讀取（me）。
- `auth.routes`：`POST /register|login|logout`、`GET /me`（me 掛 `requireAuth`）。
- `app.js`：加 `session(...)` middleware（設定同原檔 16-30 行）、`routes.use('/auth', authRouter)`。

### Task 4.3：todos/lists/tags 服務加 ownership
**Files:** Modify `src/services/todos.service.js`（與 lists/tags 視原章而定）
- 所有 todos 操作收 `userId` 參數，查詢/變更都加 `eq(todos.userId, userId)`；`loadOwnedTodo` 邏輯併入 service（以 `and(eq(id), eq(userId))` 載入，找不到回 404 不洩漏）。
- `shapeTodo` 去掉 `userId` 欄位（同原 233 行）。
- controller 從 `req.session.userId` 取得 userId 傳入 service；routes 全掛 `requireAuth`。

### Task 4.4：審視等價 + commit
對照 `07-cookie-session/完成版`（原 06）原 `app.js` 每路由行為。Commit `feat(07): session 章改寫為分層`。

---

## Phase 5：改寫 08 JWT 完成版

**教學高潮：認證邏輯已在 `auth.service`，換 token 只動一層。**

### Task 5.1：搬入 07 的分層成果為起點
複製 07 結構；本章把 session 改 JWT。

### Task 5.2：auth 改 token（只動 auth 層 + requireAuth）
- `auth.service`：加 `signToken(userId)`（jsonwebtoken，HS256，7d）；register/login 回傳 `{ token, user }`。
- `auth.controller`：移除 session 寫入，改回傳 token。
- `requireAuth`（middleware）：改成驗 `Authorization: Bearer`，解出 `req.userId`。
- `app.js`：移除 `session(...)`。
- **todos/lists/tags 的 routes/controllers/services 不動**（userId 來源由 middleware 提供）——在工作坊中明確點出這一點作為分層價值示範。

### Task 5.3：審視等價 + commit
對照原 `07-jwt/完成版/app.js`。Commit `feat(08): JWT 章改寫為分層（示範換認證只動一層）`。

---

## Phase 6：改寫 09 OAuth 完成版

### Task 6.1：起點＝08 結構
### Task 6.2：auth 加 Google 流程
- `auth.service`：加 OAuth helper（建授權 URL、code 換 token、取 userinfo、find-or-create user）。常數 `GOOGLE_*_URL`。
- `auth.controller`：`googleStart`（產 state、寫 `oauth_state` cookie、redirect）、`googleCallback`（驗 state、清 cookie、走 service、回 `{token,user}`）。
- `auth.routes`：加 `GET /google`、`GET /google/callback`。
- `app.js`：加 `cookieParser()`。
### Task 6.3：審視等價 + commit
對照原 `08-oauth/完成版/app.js`。Commit `feat(09): OAuth 章改寫為分層`。

---

## Phase 7：改寫 10 上傳完成版

### Task 7.1：起點＝09 結構（+保留 `src/config/s3.js`）
### Task 7.2：avatar/me 層 + multer
- Create `src/services/avatar.service.js`：`uploadAvatar(userId, file)`（隨機 key、PutObject、更新 users.avatarKey）、`getAvatarUrl(userId)`（找 avatarKey、getSignedUrl，404 若無）。
- `me` 路由：Create `src/routes/me.routes.js` + `src/controllers/me.controller.js`（`POST /me/avatar` 掛 `upload.single('avatar')`、`GET /me/avatar`）。multer 設定放 `src/middleware/upload.js`。
- `errorHandler`：加 multer 分支（`LIMIT_FILE_SIZE`→413、其他 MulterError→400、`只接受圖片檔`→400）。
- `auth.controller`/`me`：`/auth/me` 回傳含 `avatarKey`。
### Task 7.3：審視等價 + commit
對照原 `09-upload-to-s3/完成版/app.js`。Commit `feat(10): 上傳章改寫為分層`。

---

## Phase 8：Docker 章（13）跟齊

### Task 8.1：把 13-docker 完成版的 96 行 app.js 改成同套三層
依該 app.js 內容對應落層（多半是 todos CRUD 子集）。Dockerfile/compose 的 `CMD`/啟動指令改指 `src/server.js`。對照原行為。
Commit `refactor(13): Docker 章 app 對齊分層結構`。

---

## Phase 9：收尾

### Task 9.1：根 README 課程地圖 + 成長弧
**Files:** Modify `README.md`
- 地圖表插入新列 `06 · M4 分層架構`，其後列號/標籤順移。
- 成長弧加一行：`M4 分層架構 → 把 app.js 拆成 routes/controllers/services`，其餘箭頭順延。
- 最短完課路徑、概念卡索引補 `分層架構` 卡。

### Task 9.2：概念卡索引
**Files:** Modify `README.md`（概念卡索引段）加入 `分層架構.md` 連結。

### Task 9.3：更新 memory
**Files:** Modify `~/.claude/projects/-Users-buckychu-5xruby-nodejs-course-2025/memory/course-workshop-refactor.md`
記錄：新增分層架構章、章數 11→12（或實際）、編號順移、分層慣例（三層 + HttpError + app/server 分離）。同步 `MEMORY.md` 一行 hook。

### Task 9.4：全域連結最終掃描 + 開 PR
```bash
grep -rn "0[5-9]-\|1[0-3]-" --include=*.md . | grep -v docs/plans
```
確認無斷連結/錯誤編號。推分支、開 PR（標題與 body 說明動機與範圍）。

---

## 驗收總表（行為等價基準）

| 章 | 對照原檔 | 重點不變項 |
|---|---|---|
| 06 | 05-relations/app.js | todos/lists/tags CRUD + tag 關聯 |
| 07 | 原 06-cookie-session/app.js | auth + session + ownership |
| 08 | 原 07-jwt/app.js | token 認證；非 auth 層不變 |
| 09 | 原 08-oauth/app.js | Google OAuth + state/CSRF |
| 10 | 原 09-upload-to-s3/app.js | 頭像上傳/presigned + multer 錯誤 |
| 13 | 原 12-docker/app.js | 容器內可跑、進入點正確 |
