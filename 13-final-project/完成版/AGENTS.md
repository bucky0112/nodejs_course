# 專案開發規則

這是 Node.js + Express 課程的 todo app。產生或修改程式碼之前，先遵守下面的規則；某條規則和你的做法衝突時，照規則走，並說明你原本想怎麼做。

## 技術選擇

1. **Node.js 22.18 以上、ESM（`import` / `export`）、Express 5、Prisma 7 + PostgreSQL。我們自己寫的程式碼不用 TypeScript，不用 `require`。**
   理由：本課程全程用 ESM 與 Express 5；import 路徑要寫完整副檔名（`./todos.service.js`）。Prisma 產生的 `src/generated/` 是 TypeScript，那是工具產生的，不要手動修改。
2. **不要加入 `package.json` 裡沒有的套件。需要的話先問開發者。**
   理由：驗證、錯誤處理、路由現有的寫法都做得到，新套件會增加學習與維護成本。
3. **todos、lists、tags 存在 PostgreSQL；notes 仍存在記憶體，沒有開發者要求就不要搬。**

## 專案結構：三層

4. **每個資源由三個檔案組成，各司其職：**

   | 層 | 檔案 | 只做這些 | 不准 |
   |---|---|---|---|
   | route | `src/routes/<資源>.routes.js` | 用 `Router()` 宣告「方法 + 路徑 → controller 函式」 | 寫任何邏輯 |
   | controller | `src/controllers/<資源>.controller.js` | 從 `req` 拿參數、呼叫 service、設狀態碼、回 `res` | `if` 檢查、驗證規則、try/catch、存取資料 |
   | service | `src/services/<資源>.service.js` | 驗證、業務邏輯、用 Prisma 存取資料；回純資料或拋 `HttpError` | 出現 `req`、`res` |

   理由：每層只做一件事，出錯時知道去哪裡找；service 不依賴 HTTP，之後換資料庫或寫測試都只動一層。
5. **新資源的 router 要在 `src/routes/index.js` 掛上去。不要修改 `src/app.js` 和 `src/server.js`。**
   理由：`app.js` 只負責組裝、`server.js` 只負責啟動，新增資源不需要動它們。
6. **service 的匯出函式一律寫成 `async`，每個 Prisma 查詢都要 `await`。**

## API 設計

7. **RESTful：網址用複數名詞（`/notes`），動作交給 HTTP 方法。不要出現 `/getNotes`、`/notes/:id/delete` 這種網址。**
8. **狀態碼：**

   | 情況 | 狀態碼 |
   |---|---|
   | 查詢、更新成功 | 200 |
   | 新增成功 | 201，回傳新建立的資料 |
   | 刪除成功 | 204，沒有 body |
   | 前端送的資料不合規格（含 body 裡的 id 指向不存在的資料） | 400 |
   | 網址上的 `:id` 找不到 | 404 |
   | 跟現有資料衝突（例如名稱重複） | 409 |

9. **更新用 `PATCH`（只改有送來的欄位），不用 `PUT`。**
10. **同時可能 404 和 400 時，先檢查 404。**
    理由：資源都不存在，欄位對不對就沒有意義。
11. **存在資料庫的資料，id 交給資料庫產生（`@default(autoincrement())`）。存在記憶體的資料，id 用遞增的計數器（`nextId++`），不要用 `陣列.length + 1`。**
    理由：刪掉中間的資料後，`length + 1` 會產生重複的 id。
12. **`req.params` 和 `req.query` 的值是字串，在 controller 轉型（例如 `Number(req.params.id)`）後再傳給 service；service 要擋掉轉型失敗的 `NaN`，不能直接丟給 Prisma。**

## 錯誤處理

13. **檢查不過就在 service 裡 `throw new HttpError(狀態碼, 訊息)`（`src/lib/httpError.js`）。不要在 controller 或 route 裡直接 `res.status(4xx)`。**
14. **controller 不寫 try/catch。**
    理由：Express 5 會自動把 async 函式拋出的錯誤轉給 `src/middleware/errorHandler.js`。
15. **所有錯誤回應的形狀都是 `{ "error": "訊息" }`，由 `errorHandler` 統一產生。不要修改 `errorHandler.js`。**
16. **同一句「找不到」的錯誤訊息，在一個 service 裡只寫一次（例如抽成 `findOrThrow`）。**

## 資料層

17. **資料表結構只能透過 `prisma/schema.prisma` 加 migration 修改：改 schema → `npx prisma migrate dev --name <描述這次改了什麼>` → `npx prisma generate`。不准用 SQL 直接改資料表，也不准用 `prisma db push`。**
    理由：migration 是資料表結構的版本紀錄，跳過它，別人的資料庫和正式環境就對不上。
18. **不准修改 `prisma/migrations/` 裡已經存在的 migration 檔。要修正就產生一個新的 migration。**
    理由：已經套用到別人資料庫的 migration 被改掉，Prisma 會發現對不上並要求清空資料庫。
19. **一律從 `src/db/prisma.js` 匯入共用的 `prisma`，不要另外 `new PrismaClient()`。只有 service 可以匯入 `prisma`。**
    理由：每建立一個 client 就多一組資料庫連線；查詢集中在 service，controller 才不會跟資料庫綁在一起。
20. **用 Prisma Client 的查詢（`findMany`、`create`、`include` 等），不要寫原生 SQL（`$queryRaw`、`$executeRaw`）。**
    理由：Prisma 的查詢有型別和防 SQL injection 的保護；真的需要原生 SQL 時先問開發者。（`tests/setup.js` 清空資料表是唯一的例外。）
21. **資料庫的錯誤不能直接變成 500。可以預期的情況（找不到、外鍵指向不存在的資料、違反 UNIQUE）要先檢查，拋出對應的 `HttpError`（404、400、409）。**
22. **新增或修改 model 時，同時說明 migration 產生了哪些 SQL，並確認既有資料不會遺失（例如新增必填欄位要給預設值）。**

## 測試

23. **新增或修改路由時，在 `tests/` 用 vitest + supertest 補上測試：API 對照表的每一種狀態碼至少一個測試，每個測試都要檢查狀態碼和回應內容。測試連的是 `.env.test` 指定的測試資料庫，每個測試開始前資料表都會清空，需要的資料在測試裡自己建立（可用 `tests/helpers.js`）。**
    理由：測試是可以重複執行的規格，每次改完跑一次 `npm test` 就知道有沒有改壞別的地方。
24. **測試從 `src/app.js` 匯入 app，不要匯入 `src/server.js`、不要開 port。**
25. **不要為了讓測試通過而修改既有測試的預期結果。測試失敗時，先說明是程式錯還是測試錯，由開發者決定。**
    理由：改預期結果等於改規格，要由開發者決定。

## 完成之後

26. **列出你新增或修改的每個檔案，執行 `npm test` 並貼上結果。**
    理由：開發者要逐一驗證你的產出，才決定要不要採納。
