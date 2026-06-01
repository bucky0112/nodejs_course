#!/bin/bash

# test-local.sh - 在 Docker 中檢查本地專案
# 使用方式: ./test-local.sh ./malicious-demo

set -e

LOCAL_PATH=${1:-.}

if [ ! -d "$LOCAL_PATH" ]; then
    echo "❌ 目錄不存在: $LOCAL_PATH"
    exit 1
fi

# 取得絕對路徑
ABSOLUTE_PATH=$(cd "$LOCAL_PATH" && pwd)
PROJECT_NAME=$(basename "$ABSOLUTE_PATH")

echo ""
echo "🛡️  Local Security Check - 本地專案安全檢查"
echo "================================================"
echo "專案: $ABSOLUTE_PATH"
echo ""

docker run --rm \
  --security-opt no-new-privileges:true \
  --memory=512m \
  --cpus=0.5 \
  -v "$ABSOLUTE_PATH:/app/project:ro" \
  node:20-alpine \
  sh -c "
    cd /app/project

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
    if [ -d '.git/hooks' ]; then
        HOOKS=\$(find .git/hooks -type f ! -name \"*.sample\" 2>/dev/null)
        if [ -n \"\$HOOKS\" ]; then
            echo '⚠️  發現 Git Hooks:'
            echo \"\$HOOKS\"
            echo ''
            for hook in \$HOOKS; do
                echo \"📄 \$hook 內容:\"
                cat \"\$hook\"
                echo ''
            done
        else
            echo '✅ 無自訂 Git Hooks'
        fi
    else
        echo '✅ 無 .git 資料夾'
    fi

    echo ''
    echo '📦 [3/5] package.json scripts'
    echo '------------------------------------------'
    if [ -f 'package.json' ]; then
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
                        console.log('🚨 警告：發現安裝時自動執行的 scripts:', found.join(', '));
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
        ! -path \"./.git/*\" \
        2>/dev/null)

    if [ -n \"\$HIDDEN\" ]; then
        echo '⚠️  發現可疑隱藏檔案:'
        echo \"\$HIDDEN\"
    else
        echo '✅ 無可疑隱藏檔案'
    fi

    echo ''
    echo '⚡ [5/5] 可執行檔'
    echo '------------------------------------------'
    EXEC=\$(find . -type f -perm -u+x ! -path \"./.git/*\" ! -name \"*.sh\" 2>/dev/null)
    if [ -n \"\$EXEC\" ]; then
        echo '⚠️  發現可執行檔:'
        echo \"\$EXEC\"
    else
        echo '✅ 無可疑可執行檔'
    fi

    echo ''
    echo '=========================================='
    echo '🏁 檢查完成'
    echo '=========================================='
  "

echo ""
