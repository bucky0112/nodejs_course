# 前置作業

在開始學習 Supabase 之前，請確認你已經完成以下準備工作。

## 環境需求

### Node.js

需要 Node.js v18 或以上版本：

```bash
node -v
# 應該顯示 v18.x.x 或更高
```

如果版本過舊，請到 [Node.js 官網](https://nodejs.org/) 下載最新 LTS 版本。

### npm / pnpm

確認套件管理工具已安裝：

```bash
npm -v
# 或
pnpm -v
```

### Vue CLI

本課程的前端 Demo 使用 Vue.js，請確認已安裝 create-vue：

```bash
npm create vue@latest --help
```

如果尚未使用過，執行時會自動提示安裝。

## Supabase 帳號

### 註冊帳號

1. 前往 [Supabase](https://supabase.com/)
2. 點擊 **Start your project**
3. 使用 GitHub 帳號登入（推薦）或 Email 註冊

### 免費方案額度

Supabase 免費方案包含：

| 資源 | 額度 |
|------|------|
| 資料庫容量 | 500 MB |
| 專案數量 | 2 個 |
| API 請求 | 無限制 |
| Realtime 連線 | 200 同時連線 |
| Auth 使用者 | 50,000 MAU |
| Storage | 1 GB |

對於學習和小型專案來說綽綽有餘。

## 建議安裝的 VS Code 套件

| 套件名稱 | 用途 |
|---------|------|
| [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) | Vue 3 語法支援 |
| [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) | 程式碼檢查 |
| [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) | 測試 API（替代 Postman） |
| [PostgreSQL](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-postgresql-client2) | 資料庫瀏覽 |

## 先備知識

本章節假設你已經熟悉：

- [x] Node.js 基礎（模組系統、ES Modules）
- [x] Express.js 基礎（路由、中介軟體）
- [x] SQL 基礎（SELECT、INSERT、UPDATE、DELETE）
- [x] Vue.js 基礎（元件、響應式資料）

如果對以上內容不熟悉，建議先完成本課程前面的章節。

## 確認清單

在開始下一章之前，請確認：

- [ ] Node.js v18+ 已安裝
- [ ] npm 或 pnpm 可正常使用
- [ ] 已註冊 Supabase 帳號
- [ ] VS Code 已安裝推薦套件

準備好了嗎？讓我們開始認識 Supabase！
