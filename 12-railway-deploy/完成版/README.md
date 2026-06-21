# M9 完成版：Railway 部署設定

把這個 `railway.json` 放在你的 todo app 專案根目錄，Railway 部署時就會：

- 用 **Nixpacks** 自動偵測 Node 專案並建置（你不必寫 Dockerfile）
- 部署前先跑 `npm run migrate`（把 migration 套到正式資料庫）
- 用 `npm start` 啟動 app
- 失敗時自動重試最多 3 次

其餘（PostgreSQL、環境變數）在 Railway 後台設定，見 [工作坊](../工作坊.md)。

> 註：你的 todo app 本身已經是部署就緒的——`app.listen(process.env.PORT || 3000)` 會聽 Railway 給的 port、`package.json` 有 `start` 與 `migrate` script、`.env` 在 `.gitignore` 裡。
