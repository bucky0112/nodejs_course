# Docker 安全沙盒：安全檢視陌生專案

## 為什麼需要這個？

### 真實案例

2024 年底發生了多起資安事件：開發者從 GitHub clone 了看似正常的專案，用 VSCode 開啟後，電腦中的敏感資訊（SSH keys、環境變數、瀏覽器密碼等）就被竊取了。

### 常見攻擊手法

```
┌─────────────────────────────────────────────────────────────┐
│                    惡意專案攻擊向量                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. .vscode/settings.json                                   │
│     └── terminal.integrated.shellArgs 執行惡意命令            │
│                                                             │
│  2. .vscode/tasks.json                                      │
│     └── runOn: "folderOpen" 開啟資料夾就自動執行              │
│                                                             │
│  3. .git/hooks/                                             │
│     └── post-checkout, post-merge 等 hook 執行腳本          │
│                                                             │
│  4. package.json                                            │
│     └── postinstall, preinstall script 執行任意程式碼         │
│                                                             │
│  5. 隱藏的 shell script                                      │
│     └── 偽裝成設定檔或文件的可執行檔                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 解決方案：Docker 隔離沙盒

使用 Docker 容器來隔離不信任的程式碼，即使它執行惡意程式，也無法存取你的主機系統。

```
┌─────────────────────────────────────────────────────────────┐
│                        你的電腦 (Host)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SSH Keys, 瀏覽器密碼, 環境變數... (安全！)               │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ╳ 無法存取                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Docker 容器 (隔離)                     │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  可疑的 GitHub 專案                                │  │ │
│  │  │  - 只能存取容器內的檔案                             │  │ │
│  │  │  - 無法存取主機的檔案系統                           │  │ │
│  │  │  - 網路可選擇性隔離                                 │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 方法一：快速檢查模式

只想檢查專案內容，不需要執行程式碼。

### 步驟 1：建立安全檢查腳本

建立 `security-check.sh`：

```bash
#!/bin/bash

# 安全檢查腳本 - 在 Docker 中執行

REPO_URL=$1
REPO_NAME=$(basename "$REPO_URL" .git)

echo "🔍 開始安全檢查: $REPO_URL"
echo "================================================"

# Clone 專案（使用 --no-checkout 避免觸發 hooks）
git clone --no-checkout "$REPO_URL" "/tmp/$REPO_NAME"
cd "/tmp/$REPO_NAME"

# 手動 checkout（繞過 post-checkout hook）
git checkout HEAD -- . 2>/dev/null || git checkout HEAD

echo ""
echo "📁 檢查 .vscode 設定..."
echo "------------------------------------------------"
if [ -d ".vscode" ]; then
    echo "⚠️  發現 .vscode 資料夾！"

    if [ -f ".vscode/settings.json" ]; then
        echo "📄 settings.json 內容："
        cat .vscode/settings.json
        echo ""

        # 檢查危險設定
        if grep -E "(shellArgs|terminal\.|runOn|command)" .vscode/settings.json; then
            echo "🚨 警告：發現可能的危險設定！"
        fi
    fi

    if [ -f ".vscode/tasks.json" ]; then
        echo "📄 tasks.json 內容："
        cat .vscode/tasks.json
        echo ""

        if grep -E "(runOn.*folderOpen|command)" .vscode/tasks.json; then
            echo "🚨 警告：發現自動執行任務！"
        fi
    fi
else
    echo "✅ 沒有 .vscode 資料夾"
fi

echo ""
echo "🪝 檢查 Git Hooks..."
echo "------------------------------------------------"
if [ -d ".git/hooks" ]; then
    HOOKS=$(find .git/hooks -type f -executable 2>/dev/null | grep -v "\.sample$")
    if [ -n "$HOOKS" ]; then
        echo "⚠️  發現可執行的 Git Hooks："
        echo "$HOOKS"
        echo ""
        for hook in $HOOKS; do
            echo "📄 $hook 內容："
            head -50 "$hook"
            echo "..."
            echo ""
        done
    else
        echo "✅ 沒有可疑的 Git Hooks"
    fi
else
    echo "✅ 沒有 Git Hooks"
fi

echo ""
echo "📦 檢查 package.json scripts..."
echo "------------------------------------------------"
if [ -f "package.json" ]; then
    echo "Scripts 區塊："
    # 使用 grep 和 sed 提取 scripts 區塊
    grep -A 50 '"scripts"' package.json | grep -B 50 "^  }," | head -60
    echo ""

    # 檢查危險的 scripts
    if grep -E "(preinstall|postinstall|prepare)" package.json; then
        echo "⚠️  發現安裝時自動執行的 scripts！"
        echo "建議：使用 npm install --ignore-scripts 來安裝"
    fi
else
    echo "✅ 沒有 package.json"
fi

echo ""
echo "🔍 檢查隱藏檔案..."
echo "------------------------------------------------"
find . -name ".*" -type f ! -name ".gitignore" ! -name ".gitattributes" ! -name ".editorconfig" ! -name ".prettierrc*" ! -name ".eslint*" ! -name ".env.example" 2>/dev/null | head -20

echo ""
echo "🔍 檢查可執行檔..."
echo "------------------------------------------------"
find . -type f -executable ! -path "./.git/*" 2>/dev/null | head -20

echo ""
echo "================================================"
echo "🏁 檢查完成！請仔細審視以上內容"
echo ""
echo "如果一切正常，可以使用方法二在沙盒中執行專案"
```

### 步驟 2：在 Docker 中執行檢查

```bash
# 建立檢查用的 Docker 容器
docker run --rm -it \
  --network=host \
  -v "$(pwd)/security-check.sh:/security-check.sh:ro" \
  node:20-alpine \
  sh -c "apk add --no-cache git bash && bash /security-check.sh https://github.com/suspicious/repo"
```

或者建立一個更簡單的 alias：

```bash
# 加入你的 ~/.bashrc 或 ~/.zshrc
alias safe-check='docker run --rm -it --network=host node:20-alpine sh -c "apk add --no-cache git && git clone --no-checkout $1 /tmp/repo && cd /tmp/repo && git checkout HEAD -- . && echo \"=== .vscode ===\" && cat .vscode/*.json 2>/dev/null; echo \"=== package.json scripts ===\" && grep -A 30 scripts package.json 2>/dev/null; echo \"=== git hooks ===\" && ls -la .git/hooks/ 2>/dev/null"'
```

## 方法二：完整沙盒執行環境

需要實際執行專案來測試功能時使用。

### 建立沙盒 Dockerfile

建立 `Dockerfile.sandbox`：

```dockerfile
# 安全沙盒環境
FROM node:20-alpine

# 安裝必要工具
RUN apk add --no-cache git bash curl

# 建立非 root 使用者
RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

# 設定工作目錄
WORKDIR /app

# 切換到非 root 使用者
USER sandbox

# 預設命令
CMD ["sh"]
```

### 建立 docker-compose.sandbox.yml

```yaml
version: '3.8'

services:
  sandbox:
    build:
      context: .
      dockerfile: Dockerfile.sandbox

    # 安全設定
    security_opt:
      - no-new-privileges:true

    # 限制資源
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

    # 唯讀根檔案系統（可選，較嚴格）
    # read_only: true

    # 只掛載必要的目錄
    volumes:
      - sandbox_workspace:/app

    # 網路隔離選項
    # network_mode: none  # 完全斷網
    networks:
      - sandbox_net

    stdin_open: true
    tty: true

networks:
  sandbox_net:
    driver: bridge
    # 可選：限制外部存取
    # internal: true

volumes:
  sandbox_workspace:
```

### 使用沙盒環境

```bash
# 1. 建立並進入沙盒
docker compose -f docker-compose.sandbox.yml run --rm sandbox

# 2. 在沙盒內 clone 專案
git clone https://github.com/suspicious/repo /app/project
cd /app/project

# 3. 安全地安裝依賴（忽略 install scripts）
npm install --ignore-scripts

# 4. 檢查專案內容
ls -la
cat package.json

# 5. 如果確認安全，才執行
npm start
```

## 方法三：一鍵安全沙盒腳本

建立 `safe-clone.sh` 讓整個流程更簡單：

```bash
#!/bin/bash

# safe-clone.sh - 安全地 clone 並檢查 GitHub 專案
# 使用方式: ./safe-clone.sh https://github.com/user/repo

set -e

REPO_URL=$1

if [ -z "$REPO_URL" ]; then
    echo "使用方式: $0 <github-repo-url>"
    exit 1
fi

REPO_NAME=$(basename "$REPO_URL" .git)

echo "🛡️  安全沙盒模式"
echo "================================================"
echo "專案: $REPO_URL"
echo ""

# 建立暫時的 Dockerfile
cat > /tmp/Dockerfile.safeclone << 'EOF'
FROM node:20-alpine
RUN apk add --no-cache git bash
RUN addgroup -S sandbox && adduser -S sandbox -G sandbox
WORKDIR /app
USER sandbox
EOF

# 建構映像
echo "📦 建構沙盒環境..."
docker build -t safe-clone-sandbox -f /tmp/Dockerfile.safeclone /tmp > /dev/null 2>&1

# 在沙盒中執行檢查
echo "🔍 在隔離環境中檢查專案..."
echo ""

docker run --rm -it \
  --security-opt no-new-privileges:true \
  --memory=1g \
  --cpus=1 \
  safe-clone-sandbox \
  sh -c "
    echo '📥 Cloning (使用 --no-checkout 避免觸發 hooks)...'
    git clone --no-checkout '$REPO_URL' /app/repo 2>/dev/null
    cd /app/repo
    git checkout HEAD -- . 2>/dev/null

    echo ''
    echo '🔍 === 安全檢查報告 ==='
    echo ''

    echo '📁 .vscode 設定檔:'
    if [ -d '.vscode' ]; then
        echo '⚠️  發現 .vscode 資料夾'
        ls -la .vscode/
        echo ''
        for f in .vscode/*.json; do
            if [ -f \"\$f\" ]; then
                echo \"--- \$f ---\"
                cat \"\$f\"
                echo ''
            fi
        done
    else
        echo '✅ 無'
    fi

    echo ''
    echo '🪝 Git Hooks:'
    if ls .git/hooks/* 2>/dev/null | grep -v '.sample' > /dev/null; then
        echo '⚠️  發現 Git Hooks'
        ls .git/hooks/ | grep -v '.sample'
    else
        echo '✅ 無可疑 hooks'
    fi

    echo ''
    echo '📦 package.json scripts:'
    if [ -f 'package.json' ]; then
        node -e \"
            const pkg = require('./package.json');
            const scripts = pkg.scripts || {};
            const dangerous = ['preinstall', 'postinstall', 'prepare', 'prepublish'];

            console.log(JSON.stringify(scripts, null, 2));

            const found = dangerous.filter(s => scripts[s]);
            if (found.length > 0) {
                console.log('');
                console.log('⚠️  發現安裝時自動執行的 scripts:', found.join(', '));
            }
        \"
    else
        echo '✅ 無 package.json'
    fi

    echo ''
    echo '================================================'
    echo '檢查完成！'
    echo ''
    echo '如果要繼續在沙盒中執行專案，請執行：'
    echo '  docker run --rm -it -v \$(pwd)/sandbox:/app safe-clone-sandbox'
  "

echo ""
echo "🏁 安全檢查結束"
```

使用方式：

```bash
chmod +x safe-clone.sh
./safe-clone.sh https://github.com/suspicious/repo
```

## 進階：VSCode Dev Container

如果你習慣用 VSCode，可以使用 Dev Container 功能在隔離環境中開發。

建立 `.devcontainer/devcontainer.json`：

```json
{
  "name": "Safe Sandbox",
  "image": "node:20",

  // 安全設定
  "runArgs": [
    "--security-opt", "no-new-privileges:true",
    "--memory=2g",
    "--cpus=2"
  ],

  // 不要自動執行任何東西
  "postCreateCommand": "",
  "postStartCommand": "",

  // 最小化擴充套件
  "customizations": {
    "vscode": {
      "extensions": [],
      "settings": {
        // 停用所有自動執行功能
        "task.allowAutomaticTasks": "off",
        "npm.autoDetect": "off",
        "terminal.integrated.allowWorkspaceConfiguration": false
      }
    }
  }
}
```

## 安全檢查清單

在信任任何專案之前，確認以下項目：

```
□ .vscode/settings.json
  □ 沒有 terminal.integrated.shellArgs
  □ 沒有可疑的 command 設定

□ .vscode/tasks.json
  □ 沒有 runOn: "folderOpen"
  □ 任務內容合理

□ .git/hooks/
  □ 沒有可執行的自訂 hooks
  □ 只有 .sample 結尾的範例檔

□ package.json
  □ preinstall/postinstall 內容合理
  □ prepare script 內容合理
  □ 依賴套件是正常的套件（非 typosquatting）

□ 一般檢查
  □ 沒有奇怪的隱藏檔案
  □ 沒有偽裝的可執行檔
  □ README 描述與實際內容相符
```

## 總結

```
┌─────────────────────────────────────────────────────────────┐
│                    安全工作流程                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 發現有趣的 GitHub 專案                                    │
│           ↓                                                 │
│  2. 使用 safe-clone.sh 在 Docker 中檢查                      │
│           ↓                                                 │
│  3. 審視安全報告                                              │
│           ↓                                                 │
│     ┌─────┴─────┐                                           │
│     ↓           ↓                                           │
│  有可疑內容    安全                                           │
│     ↓           ↓                                           │
│  放棄或      在沙盒中執行                                      │
│  深入調查    確認功能正常                                      │
│                 ↓                                           │
│           clone 到主機                                       │
│           正常開發                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

記住：**寧可多花 30 秒檢查，也不要花 3 小時處理資安事件！**
