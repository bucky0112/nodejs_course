# 第 1 堂 · Node.js 核心概念與環境：開課前的地基

> 對應課綱第 1 堂（執行環境、模組系統 CommonJS / ESM）。這堂還不寫 todo app，但**後面每一堂都用得到**：ESM 語法、npm、內建模組。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：幾支小程式，把 Node 的基本功各跑一遍：自己寫模組、認得 CommonJS、用內建 `path` / `url`，最後用**原生 `http` 模組**做一個極簡 todo 伺服器。

**搞懂**：
- Node.js 是什麼（瀏覽器外的 JavaScript 執行環境），跟瀏覽器 JS 差在哪
- 用 nvm 裝、切 Node 版本（本課程基準：**Node 22 LTS**）
- ESM（`import` / `export`）怎麼用，CommonJS（`require`）長什麼樣
- 為什麼 `__dirname` 在 ESM 會出錯
- 為什麼之後要換成 Express（你會親手感受到原生 http 寫路由有多囉嗦）

> 這堂刻意**不用任何框架**。先把 Node 本身摸熟，到[第 3 堂](../03-express-basics-and-routing/)才知道 Express 幫你省掉了什麼。

---

## ② 前置檢查

開始前，確認你具備：

- [ ] 一台能裝軟體的電腦（macOS / Linux / Windows 皆可）。
- [ ] 基本的 JavaScript 語法（變數、函式、陣列、物件）。
- [ ] 一個終端機（Terminal / iTerm / Windows Terminal）。

> 不需要先會後端、資料庫或任何框架。這就是起點。

> 🪟 **Windows 使用者**：課程指令以 bash 為基準，`curl` / `cp` / `psql` 等少數指令在 Windows 寫法不同。先看一眼 [Windows 指令對照](../concepts/windows-指令對照.md)，建議用 PowerShell（Windows Terminal 預設）。

---

## ③ 工作坊

跟著一步步把 Node 基本功跑過一遍，每個步驟都有檢查點：

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–1 | 用 nvm 裝好 Node 22、玩 REPL | A |
| 2–3 | 建專案、設 ESM、裝 npm 套件 | B |
| 4 | 自己寫模組（export / import） | C |
| 5 | 認得 CommonJS（`require` / `module.exports`） | D |
| 6 | 內建模組 `path` / `url`（含 `__dirname` 正解） | E |
| 7 | 原生 `http` 做極簡 todo 伺服器 | F（完成版） |

完成版程式碼放在 [`完成版/`](./完成版/)，卡關時可比對。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [ESM vs CommonJS](../concepts/esm-vs-cjs.md)：兩套模組系統、`import.meta.dirname` 取代 `__dirname`

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：跑完工作坊後，先試[課堂練習](./課堂練習.md)：不看完成版，自己寫一個模組，再把它接進原生 http 伺服器。練的是「能不能獨立寫出來」，跟下面的挑戰（延伸）分工。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm run modules    # 自己寫的模組：印出 8 / 2 / Hello, Node!
npm run cjs        # CommonJS：印出 CommonJS: 3
npm run builtins   # path / url，用 import.meta.dirname
npm run server     # 原生 http todo 伺服器
```

逐一確認：

- [ ] `node -v` 顯示 v22.x 以上
- [ ] `npm run modules` 印出 `8` / `2` / `Hello, Node!`
- [ ] `npm run cjs` 印出 `CommonJS: 3`
- [ ] `npm run builtins` 不會報 `__dirname is not defined`
- [ ] 伺服器啟動後 `curl localhost:3000/todos` 回傳 todo 陣列、`/health` 回 OK、亂打路徑回 404

### 挑戰（可選，加深理解）

1. **加一個路由**：在 `server.js` 加 `GET /todos/first`，回傳第一筆 todo。寫完你會發現：每加一條路由就要多一個 `else if`，這就是之後要用 Express 的原因。
2. **動態載入**：分別跑 `node modules-main.js` 和 `node modules-main.js --report`，比較有沒有印出 `[report.js] 模組載入了`，觀察 `await import()` 讓模組「用得到才載入」。
3. **裝個玩具套件**：照 [cowsay](https://github.com/piuccio/cowsay) 的文件，`npm install cowsay` 後讓終端機的牛講話。

---

**下一堂 → [第 2 堂 · 非同步處理與事件迴圈](../02-async-and-event-loop/)**
