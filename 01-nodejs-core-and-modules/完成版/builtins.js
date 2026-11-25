import path from 'node:path'

// ⚠️ ESM 裡沒有 __dirname！要用 import.meta.dirname（Node 20.11+ / 22 LTS 內建）
// 詳見 concepts/esm-vs-cjs.md
const here = import.meta.dirname

// path：跨平台組合路徑（Windows 用 \，Unix 用 /，這裡幫你處理掉差異）
const fullPath = path.join(here, 'files', 'test.txt')
console.log('完整路徑:', fullPath)
console.log('檔名:', path.basename(fullPath)) // test.txt
console.log('副檔名:', path.extname(fullPath)) // .txt
console.log('解析:', path.parse(fullPath))

// URL：解析與操作網址（瀏覽器和 Node 都有的標準 API）
const myUrl = new URL('https://example.com/path?name=test&age=25')
console.log('hostname:', myUrl.hostname) // example.com
console.log('pathname:', myUrl.pathname) // /path
console.log('查詢參數 name:', myUrl.searchParams.get('name')) // test

myUrl.searchParams.append('sort', 'desc')
console.log('加參數後:', myUrl.href)
