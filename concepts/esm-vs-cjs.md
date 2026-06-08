# 概念卡：ESM vs CommonJS

> 一句話：Node 有兩套模組系統——老的 **CommonJS**（`require` / `module.exports`）和新的 **ESM**（`import` / `export`）。本課程全程用 ESM，但你會在很多舊套件、舊文章看到 CJS，得認得出來。

---

## 一、兩種寫法對照

```js
// CommonJS（舊，預設副檔名 .js 在沒設定時）
const fs = require('node:fs')
module.exports = { add }

// ESM（新，本課程用這個）
import fs from 'node:fs'
export { add }
```

怎麼讓 Node 用 ESM？在 `package.json` 加一行：

```json
{ "type": "module" }
```

加了之後，`.js` 檔就用 `import`/`export`。沒加（或設 `"commonjs"`），就用 `require`。

> 也可以用副檔名強制：`.mjs` 永遠是 ESM、`.cjs` 永遠是 CJS。但實務上設一次 `"type": "module"` 最省事。

---

## 二、最常見的踩雷：ESM 沒有 `__dirname`

CJS 裡有兩個「免費」變數：`__dirname`（目前檔案的資料夾）和 `__filename`。**ESM 裡這兩個不存在**，直接用會炸：

```js
// ESM 裡這行會 ReferenceError: __dirname is not defined
const p = path.join(__dirname, 'data.txt')
```

正解（Node 20.11+ / 22 LTS 內建）：

```js
const p = path.join(import.meta.dirname, 'data.txt')   // ← 直接用這個
```

更舊的 Node 要這樣補（看舊文章會遇到）：

```js
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
```

> 本課程用 Node 22，一律用 `import.meta.dirname`，乾淨。

---

## 三、其他差異（夠用就好）

| | CommonJS | ESM |
|---|---|---|
| 載入時機 | 同步、執行到才載 | 靜態、檔案開頭先解析 |
| 條件式載入 | `if (x) require(...)` 可以 | `import` 要放最上層；條件載入用 `await import()` |
| 內建模組 | `require('fs')` | `import fs from 'node:fs'`（建議加 `node:` 前綴） |

動態載入（ESM 版的條件 require）：

```js
if (needHeavy) {
  const { heavy } = await import('./heavy.js')
}
```

---

## 延伸
- 內建模組建議寫成 `import fs from 'node:fs'`：`node:` 前綴明確表示「這是 Node 內建，不是 npm 套件」，也避免被同名套件蓋掉。
- 為什麼世界上還有一堆 CJS？因為它比 ESM 早十年，生態還在遷移。你新寫的專案直接用 ESM 就好。
