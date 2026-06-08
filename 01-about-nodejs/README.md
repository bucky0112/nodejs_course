# S0 · Node.js 基礎：開課前的地基

> 側模組（side module）· 入門前置（primer）。這章不屬於主線 todo app，但**主線全程都用到它**——ESM 語法、npm、非同步、內建模組。已經熟悉的人可以快速掃過驗收清單，卡住再回來。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：幾支小程式，把 Node 的基本功各跑一遍——自己寫模組、比較同步 vs 非同步讀檔、用內建 `path`/`url`，最後用**原生 `http` 模組**做一個極簡 todo 伺服器。

**搞懂**：
- Node.js 是什麼（瀏覽器外的 JavaScript 執行環境），跟瀏覽器 JS 差在哪
- 用 nvm 裝、切 Node 版本（本課程基準：**Node 22 LTS**）
- ESM（`import`/`export`）怎麼用、為什麼 `__dirname` 在 ESM 會炸
- 非同步：callback → Promise → async/await
- 為什麼下一章要換成 Express（你會親手感受到原生 http 寫路由有多囉嗦）

> 這章刻意**不用任何框架**。先把 Node 本身摸熟，[M1] 才知道 Express 幫你省掉了什麼。

---

## ② 前置檢查

開始前，確認你具備：

- [ ] 一台能裝軟體的電腦（macOS / Linux / Windows 皆可）。
- [ ] 基本的 JavaScript 語法（變數、函式、陣列、物件）。
- [ ] 一個終端機（Terminal / iTerm / Windows Terminal）。

> 不需要先會後端、資料庫或任何框架。這就是起點。

---

## ③ 工作坊

跟著一步步把 Node 基本功跑過一遍，每個步驟都有檢查點：

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–1 | 用 nvm 裝好 Node 22、玩 REPL | A |
| 2–3 | 建專案、設 ESM、裝 npm 套件 | B |
| 4 | 自己寫模組（export / import） | C |
| 5 | 同步 vs 非同步讀檔對照 | D |
| 6 | 內建模組 `path` / `url`（含 `__dirname` 正解） | E |
| 7 | 原生 `http` 做極簡 todo 伺服器 | F（完成版） |

完成版程式碼放在 [`完成版/`](./完成版/)，卡關時可比對。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [ESM vs CommonJS](../concepts/esm-vs-cjs.md) — 兩套模組系統、`import.meta.dirname` 取代 `__dirname`
- [Node.js 的非同步機制](../concepts/非同步機制.md) — 單執行緒、callback/Promise/async-await、為什麼要非同步

---

## ⑤ 驗收 + 挑戰

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm run modules    # 自己寫的模組：印出 8 / 2 / Hello, Node!
npm run sync       # 同步讀檔：一個讀完才讀下一個
npm run async      # 非同步讀檔：「還在讀就先往下跑」
npm run builtins   # path / url，用 import.meta.dirname
npm run server     # 原生 http todo 伺服器
```

逐一確認：

- [ ] `node -v` 顯示 v22.x
- [ ] `npm run modules` 印出 `8` / `2` / `Hello, Node!`
- [ ] `npm run async` 裡「我已經執行到這行了」**早於**「檔案完成」印出
- [ ] `npm run builtins` 不會報 `__dirname is not defined`
- [ ] 伺服器啟動後 `curl localhost:3000/todos` 回傳 todo 陣列、`/health` 回 OK、亂打路徑回 404

### 挑戰（可選，加深理解）

1. **加一個路由**：在 `server.js` 加 `GET /todos/first`，回傳第一筆 todo。寫完你會發現——每加一條路由就要多一個 `else if`，這就是 [M1] 要用 Express 的動機。
2. **動態載入**：跑 `node modules-main.js --extra`，觀察 `await import()` 何時才載入模組。
3. **裝個玩具套件**：照 [cowsay](https://github.com/piuccio/cowsay) 的文件，`npm install cowsay` 後讓終端機的牛講話。

---

**下一章 → [M1 · Express 骨架](../02-express-basics/)**（用框架重寫剛剛那個囉嗦的 http 伺服器）
