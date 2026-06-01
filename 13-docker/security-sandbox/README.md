# Security Sandbox Tools

在 Docker 沙盒中安全地檢查和執行陌生的 Git 專案。

## 快速開始

### 檢查專案（不執行）

```bash
./safe-clone.sh https://github.com/user/repo
```

這會在 Docker 容器中 clone 專案，並檢查：
- `.vscode/` 設定檔
- Git hooks
- `package.json` scripts
- 隱藏檔案
- 可執行檔

### 在沙盒中執行專案

```bash
./run-in-sandbox.sh https://github.com/user/repo
```

這會啟動一個互動式沙盒環境，你可以在其中：
- 安全地 `npm install --ignore-scripts`
- 執行並測試專案
- 專案無法存取你的主機檔案系統

### 使用 Docker Compose

```bash
docker compose -f docker-compose.sandbox.yml run --rm sandbox
```

進入沙盒後手動 clone 和操作。

## 為什麼需要這個？

惡意專案可能透過以下方式在你的電腦上執行程式碼：

1. **`.vscode/tasks.json`** - `runOn: "folderOpen"` 開啟資料夾就執行
2. **`.vscode/settings.json`** - 透過 terminal 設定執行命令
3. **Git hooks** - clone 或 checkout 時執行
4. **npm scripts** - `postinstall` 在安裝時執行

使用 Docker 沙盒，即使這些惡意程式碼被執行，也無法存取你的主機系統。
