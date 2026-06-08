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

## 關於 `malicious-demo/`（本地測試目標）

本目錄下的 `malicious-demo/` 是一個**刻意製作的惡意專案範例**，用來示範
上述各種攻擊向量，並驗證 `safe-clone.sh` / `test-local.sh` 的偵測效果。

它**不會被納入課程 repo**（已在根目錄 `.gitignore` 排除），原因有二：

1. 內含偽裝的惡意腳本（`.hidden-malware.sh`）與惡意 git hooks
   （`.git/hooks/post-checkout`、`post-merge`），不適合隨課程散布。
2. 它本身帶有獨立的巢狀 `.git`，正是要讓學生用工具偵測「clone 時自動
   執行的 git hooks」這個攻擊向量。

### 講師如何準備這個測試目標

在 `security-sandbox/` 下建立 `malicious-demo/`，放入以下檔案各自示範一種
攻擊向量，再 `git init` 並在 `.git/hooks/` 放入會輸出訊息的 hook 即可：

| 攻擊向量 | 檔案 |
|---------|------|
| npm scripts | `package.json` 的 `preinstall` / `postinstall` |
| VSCode 自動執行 | `.vscode/tasks.json`（`runOn: folderOpen`） |
| VSCode terminal | `.vscode/settings.json`（`shellArgs`） |
| Git hooks | `.git/hooks/post-checkout`、`post-merge` |
| 隱藏可執行檔 | `.hidden-malware.sh` |

> ⚠️ hook 與腳本內容請只用 `echo` 示範，**不要寫入任何真正具破壞性的命令**。
