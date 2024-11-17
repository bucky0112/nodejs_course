## 關於 Node.js

- Node.js 是一個基於 Chrome V8 引擎的 JavaScript 執行環境（runtime environment）
- Node.js 讓 JavaScript 從「只能在瀏覽器中運作」變成「可以在任何地方運作」
  
## 與瀏覽器中的 JavaScript 的主要區別

- 執行環境不同：

  - 瀏覽器 JS：運行在瀏覽器環境，能操作 DOM、BOM
  - Node.js：運行在伺服器環境，能進行檔案操作、網路通訊


- 核心 API 不同：

  - 瀏覽器 JS：有 window、document 等物件
  - Node.js：有 fs、http、path 等模組，用於伺服器端操作


- 模組系統：

  - 瀏覽器 JS：傳統上使用 script 標籤，現代才開始支援 ES Modules
  - Node.js：一開始就有完整的模組系統（CommonJS）

## 前端工程師為什麼需要了解 Node.js？

- 豐富的套件生態系統，npm（Node Package Manager），世界上最大的開源套件庫
- 理解後端運作原理，有助於前後端協作
