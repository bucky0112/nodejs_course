# 第 8 堂 · 測試與驗證 API：讓 AI 的產出一鍵驗證

> 對應課綱第 8 堂（對 AI 輸出做測試）。延續第 7 堂的 todo app（含 AI 產生的 `/notes`）。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：用 vitest + supertest 替 `/todos` 和 `/notes` 寫測試，`npm test` 一個指令驗證整個 API；並把「要寫測試」加進 `AGENTS.md`。

**搞懂**：
- 測試就是把 API 對照表變成可以執行的程式
- 為什麼 `app.js` 和 `server.js` 要分開（測試不用開 port）
- 怎麼確認一個測試真的有在檢查東西（故意改壞）
- 審查 AI 寫的測試要看什麼：有沒有漏情境、有沒有把錯誤的行為當成預期
- 請 AI 審查程式碼時，怎麼判斷它的建議要不要採納

---

## ② 前置檢查

- [ ] 完成[第 7 堂](../07-ai-assisted-api-scaffolding/)，手上有含 `/notes` 和 `AGENTS.md` 的 todo app（或直接複製[第 7 堂完成版](../07-ai-assisted-api-scaffolding/完成版/)）。
- [ ] 專案用 git 管理，有一個乾淨的 commit 可以回去。
- [ ] 能用的 AI 開發工具（第 7 堂用的那一個）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–1 | 為什麼寫測試、裝好 vitest 和 supertest | A |
| 2 | 第一個測試 | B |
| 3 | 把 `/todos` 的對照表全部寫成測試 | C |
| 4 | 故意改壞，確認測試抓得到 | D |
| 5 | 請 AI 替 `/notes` 寫測試，再審查 | E |
| 6 | 請 AI 依規則審查、把測試規則加進 `AGENTS.md` | F（完成版） |

完成版放在 [`完成版/`](./完成版/)，測試在 [`完成版/tests/`](./完成版/tests/)。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [分層架構 § app.js 與 server.js 分開](../concepts/分層架構.md)：測試為什麼能不開 port
- [HTTP 狀態碼](../concepts/http-狀態碼.md)：寫測試的預期值從這裡來，不是從程式碼抄

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試[課堂練習](./課堂練習.md)：不用 AI，自己補齊測試沒涵蓋到的情境。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm install
npm test
```

逐一確認：

- [ ] `npm test` 全部通過，結束碼是 0
- [ ] `tests/todos.test.js` 和 `tests/notes.test.js` 都有成功和失敗（400、404）的測試
- [ ] 把任一個 controller 的 `201` 改成 `200`，至少一個測試會失敗
- [ ] `AGENTS.md` 有測試相關規則

### 挑戰（可選，加深理解）

1. **watch 模式**：開著 `npm run test:watch` 改程式，看測試怎麼自動重跑。
2. **測試 service**：service 不認識 `req`、`res`，可以不透過 HTTP 直接測。替 `todos.service.js` 的 `updateTodo` 寫一個直接呼叫函式的測試，比較它和 supertest 測試的差別。
3. **規則檔的測試**：請 AI 加一個 `/tags` 資源，看它有沒有照第 17 條規則附上測試。

---

**下一堂 → [第 9 堂 · PostgreSQL 基礎](../09-postgresql-basics/)**
