#!/bin/bash

# safe-clone.sh - 安全地 clone 並檢查 GitHub 專案
# 使用方式: ./safe-clone.sh https://github.com/user/repo

set -e

REPO_URL=$1

if [ -z "$REPO_URL" ]; then
    echo "🛡️  Safe Clone - 在 Docker 沙盒中安全檢查 Git 專案"
    echo ""
    echo "使用方式: $0 <git-repo-url>"
    echo ""
    echo "範例:"
    echo "  $0 https://github.com/user/repo"
    echo "  $0 git@github.com:user/repo.git"
    exit 1
fi

REPO_NAME=$(basename "$REPO_URL" .git)

echo ""
echo "🛡️  Safe Clone - 安全沙盒模式"
echo "================================================"
echo "專案: $REPO_URL"
echo ""

# 建立暫時的 Dockerfile
TEMP_DIR=$(mktemp -d)
cat > "$TEMP_DIR/Dockerfile" << 'EOF'
FROM node:20-alpine
RUN apk add --no-cache git bash
RUN addgroup -S sandbox && adduser -S sandbox -G sandbox
WORKDIR /app
USER sandbox
EOF

# 建構映像
echo "📦 建構沙盒環境..."
docker build -t safe-clone-sandbox -f "$TEMP_DIR/Dockerfile" "$TEMP_DIR" > /dev/null 2>&1

# 清理暫時檔案
rm -rf "$TEMP_DIR"

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
    git clone --no-checkout '$REPO_URL' /app/repo 2>&1 || { echo '❌ Clone 失敗'; exit 1; }
    cd /app/repo
    git checkout HEAD -- . 2>/dev/null || git reset --hard HEAD 2>/dev/null

    echo ''
    echo '=========================================='
    echo '🔍 安全檢查報告'
    echo '=========================================='
    echo ''

    # 檢查 .vscode
    echo '📁 [1/5] .vscode 設定檔'
    echo '------------------------------------------'
    if [ -d '.vscode' ]; then
        echo '⚠️  發現 .vscode 資料夾'
        for f in .vscode/*.json; do
            if [ -f \"\$f\" ]; then
                echo ''
                echo \"📄 \$f:\"
                cat \"\$f\"
                echo ''

                # 檢查危險關鍵字
                if grep -qE '(shellArgs|terminal\\.integrated|runOn.*folderOpen)' \"\$f\" 2>/dev/null; then
                    echo '🚨 警告：發現可能危險的設定！'
                fi
            fi
        done
    else
        echo '✅ 無 .vscode 資料夾'
    fi

    echo ''
    echo '🪝 [2/5] Git Hooks'
    echo '------------------------------------------'
    HOOKS=\$(find .git/hooks -type f ! -name \"*.sample\" 2>/dev/null)
    if [ -n \"\$HOOKS\" ]; then
        echo '⚠️  發現 Git Hooks:'
        echo \"\$HOOKS\"
        echo ''
        for hook in \$HOOKS; do
            echo \"📄 \$hook 內容 (前 20 行):\"
            head -20 \"\$hook\"
            echo '...'
            echo ''
        done
    else
        echo '✅ 無自訂 Git Hooks'
    fi

    echo ''
    echo '📦 [3/5] package.json scripts'
    echo '------------------------------------------'
    if [ -f 'package.json' ]; then
        # 顯示 scripts
        node -e \"
            try {
                const pkg = require('./package.json');
                const scripts = pkg.scripts || {};

                if (Object.keys(scripts).length === 0) {
                    console.log('✅ 無 scripts');
                } else {
                    console.log(JSON.stringify(scripts, null, 2));

                    const dangerous = ['preinstall', 'postinstall', 'prepare', 'prepublish', 'prepublishOnly'];
                    const found = dangerous.filter(s => scripts[s]);
                    if (found.length > 0) {
                        console.log('');
                        console.log('⚠️  發現安裝時自動執行的 scripts:', found.join(', '));
                        console.log('   建議使用: npm install --ignore-scripts');
                    }
                }
            } catch(e) {
                console.log('❌ 無法解析 package.json:', e.message);
            }
        \" 2>/dev/null || echo '❌ 無法解析 package.json'
    else
        echo '✅ 無 package.json'
    fi

    echo ''
    echo '🔎 [4/5] 隱藏檔案'
    echo '------------------------------------------'
    HIDDEN=\$(find . -maxdepth 2 -name \".*\" -type f \
        ! -name \".gitignore\" \
        ! -name \".gitattributes\" \
        ! -name \".editorconfig\" \
        ! -name \".prettierrc*\" \
        ! -name \".eslintrc*\" \
        ! -name \".env.example\" \
        ! -name \".env.template\" \
        ! -name \".npmrc\" \
        ! -name \".nvmrc\" \
        ! -name \".node-version\" \
        ! -path \"./.git/*\" \
        2>/dev/null | head -10)

    if [ -n \"\$HIDDEN\" ]; then
        echo '發現以下隱藏檔案（請確認是否合理）:'
        echo \"\$HIDDEN\"
    else
        echo '✅ 無可疑隱藏檔案'
    fi

    echo ''
    echo '⚡ [5/5] 可執行檔'
    echo '------------------------------------------'
    EXEC=\$(find . -type f -executable ! -path \"./.git/*\" 2>/dev/null | head -10)
    if [ -n \"\$EXEC\" ]; then
        echo '發現可執行檔（請確認是否合理）:'
        echo \"\$EXEC\"
    else
        echo '✅ 無可執行檔'
    fi

    echo ''
    echo '=========================================='
    echo '🏁 檢查完成'
    echo '=========================================='
    echo ''
    echo '如需在沙盒中執行專案，請使用:'
    echo '  ./run-in-sandbox.sh $REPO_URL'
  "

echo ""
echo "🏁 安全檢查結束"
echo ""
