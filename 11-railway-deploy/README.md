# M8 · Railway 部署：把 todo app 送上線

> 主線章節（spine）· **主線終點**。把你一路建起來的 todo app 部署到 Railway，拿到一個公開網址。Railway 會自動偵測 Node 專案，**不必先學 Docker**。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：todo app 跑在 Railway 上、有公開網址、連著 Railway 的 PostgreSQL、部署時自動跑 migration。

**搞懂**：
- 上線與開發的差異：環境變數、port、正式設定
- 怎麼讓 migration 在部署時自動執行
- 為什麼 Railway 不必寫 Dockerfile 也能部署（Nixpacks 自動偵測）

---

## ② 前置檢查

- [ ] 一個能部署的 todo app（[M7] 或你目前的進度）。
- [ ] 程式已部署就緒：`app.listen(process.env.PORT || 3000)`、`package.json` 有 `start`、`.env` 在 `.gitignore`。
- [ ] 一個 [Railway](https://railway.app/) 帳號，專案推上 GitHub（或裝 Railway CLI）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 1 | 確認程式部署就緒 | A |
| 2 | 在 Railway 建專案、加 PostgreSQL | B |
| 3 | 設環境變數、部署時跑 migration | C |
| 4 | 部署、拿網址、線上測試 | D（完成版） |

完成版（`railway.json`）在 [`完成版/`](./完成版/)。

---

## ④ 概念卡

- [部署：環境變數與正式設定](../concepts/部署-環境變數與正式設定.md)

---

## ⑤ 驗收 + 挑戰

確認：

- [ ] Railway 給了一個公開網址，打 `GET /todos`（帶 token）能回應
- [ ] 註冊、登入、建 todo 在線上正常運作（資料存進 Railway 的 PostgreSQL）
- [ ] 部署 log 裡看得到 migration 有執行
- [ ] 機密都在 Railway 的 Variables，不在程式碼裡

### 挑戰（可選）

1. 綁一個自訂網域。
2. 設 GitHub 自動部署：push 到 main 就自動上線。
3. 把 `secure: true` cookie / 正式 CORS 等設定依 `NODE_ENV` 切好。

---

🎉 **主線到此完課！** 你有一個部署上線的 todo app（會員、清單、標籤、Google 登入、頭像、PostgreSQL）。

想更進一步把部署做成可攜的容器 → 進階旁支 [S3 · Docker]。
