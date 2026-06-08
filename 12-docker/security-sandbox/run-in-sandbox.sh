#!/bin/bash

# run-in-sandbox.sh - 在 Docker 沙盒中執行專案
# 使用方式: ./run-in-sandbox.sh https://github.com/user/repo

set -e

REPO_URL=$1

if [ -z "$REPO_URL" ]; then
    echo "🛡️  Run in Sandbox - 在 Docker 沙盒中執行專案"
    echo ""
    echo "使用方式: $0 <git-repo-url>"
    echo ""
    echo "範例:"
    echo "  $0 https://github.com/user/repo"
    exit 1
fi

REPO_NAME=$(basename "$REPO_URL" .git)

echo ""
echo "🛡️  Run in Sandbox - 安全執行模式"
echo "================================================"
echo "專案: $REPO_URL"
echo ""

# 建立沙盒環境
TEMP_DIR=$(mktemp -d)
cat > "$TEMP_DIR/Dockerfile" << 'EOF'
FROM node:22

# 安裝常用工具
RUN apt-get update && apt-get install -y git curl && rm -rf /var/lib/apt/lists/*

# 建立非 root 使用者
RUN groupadd -r sandbox && useradd -r -g sandbox sandbox

WORKDIR /app
RUN chown sandbox:sandbox /app

USER sandbox
EOF

echo "📦 建構沙盒環境..."
docker build -t run-sandbox -f "$TEMP_DIR/Dockerfile" "$TEMP_DIR" > /dev/null 2>&1
rm -rf "$TEMP_DIR"

echo "📥 在沙盒中 clone 並啟動互動式 shell..."
echo ""
echo "提示："
echo "  - 使用 'npm install --ignore-scripts' 安全安裝依賴"
echo "  - 執行 'npm start' 或 'node index.js' 啟動專案"
echo "  - 輸入 'exit' 離開沙盒"
echo ""
echo "================================================"

docker run --rm -it \
  --security-opt no-new-privileges:true \
  --memory=2g \
  --cpus=2 \
  -p 3000:3000 \
  -p 5173:5173 \
  -p 8080:8080 \
  run-sandbox \
  bash -c "
    echo '📥 Cloning 專案...'
    git clone '$REPO_URL' /app/project
    cd /app/project
    echo ''
    echo '✅ 專案已 clone 到 /app/project'
    echo ''
    echo '你現在在隔離的沙盒環境中，可以安全地：'
    echo '  1. 檢查程式碼'
    echo '  2. npm install --ignore-scripts'
    echo '  3. npm start'
    echo ''
    exec bash
  "

echo ""
echo "🏁 已離開沙盒環境"
