# 第 2 堂 · 非同步處理與事件迴圈

> 對應課綱第 2 堂（callback、Promise、async/await）。這堂一樣還不寫 todo app，但之後每一堂處理請求、查資料庫，都建立在這堂的直覺上。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：幾支小程式，親眼看到同步和非同步的差別，用三種寫法完成同一件非同步工作，並預測一段程式的執行順序。

**搞懂**：
- 為什麼單執行緒的 Node 需要非同步
- callback → Promise → async/await 三代寫法其實在做同一件事
- 三種寫法各自怎麼接錯誤
- 事件迴圈的執行順序：同步 → microtask → timer

---

## ② 前置檢查

開始前，確認你具備：

- [ ] 完成[第 1 堂](../01-nodejs-core-and-modules/)：Node 22 裝好、會用 `import` / `export`、知道 `"type": "module"`。
- [ ] 一個終端機。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–1 | 同步 vs 非同步讀檔對照 | A |
| 2 | callback / Promise / async-await 各寫一次 | B |
| 3 | 預測並驗證事件迴圈的執行順序 | C（完成版） |

完成版程式碼放在 [`完成版/`](./完成版/)，卡關時可比對。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [Node.js 的非同步機制](../concepts/非同步機制.md)：單執行緒、callback / Promise / async-await、為什麼要非同步

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：跑完工作坊後，先試[課堂練習](./課堂練習.md)：不看 `three-ways.js`，自己把同一段流程用 callback → Promise → async/await 各寫一遍。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm run sync         # 同步讀檔：一個讀完才讀下一個
npm run async        # 非同步讀檔：「還在讀就先往下跑」
npm run three-ways   # 三代寫法，三行內容相同
npm run event-loop   # 印出 1 → 5 的順序
```

逐一確認：

- [ ] `npm run async` 裡「我已經執行到這行了」**早於**「檔案完成」印出
- [ ] `npm run three-ways` 依序印出 `[callback]`、`[Promise]`、`[async/await]`，內容相同
- [ ] `npm run event-loop` 依 1、2、3、4、5 的順序印出

### 挑戰（可選，加深理解）

1. **故意出錯**：把 `three-ways.js` 裡的 `file2.txt` 改成不存在的檔名，三種寫法的錯誤分別從哪裡被接到？
2. **卡住事件迴圈**：在 `event-loop.js` 的最後加一段跑 2 秒的 `while` 迴圈（`const end = Date.now() + 2000; while (Date.now() < end) {}`），timer 什麼時候才印？想想這對伺服器代表什麼。
3. **await 也是 microtask**：在 `event-loop.js` 加一個 `async` 函式，`await` 之前和之後各印一行，預測它們會插在哪裡。

---

**下一堂 → [第 3 堂 · Express 入門與路由設計](../03-express-basics-and-routing/)**
