# path 處理檔案路徑

```
const path = require('path');

// 組合路徑
const fullPath = path.join(__dirname, 'files', 'test.txt');
console.log('完整路徑:', fullPath);

// 取得檔案名稱
console.log('檔案名稱:', path.basename(fullPath)); // test.txt

// 取得檔案副檔名
console.log('副檔名:', path.extname(fullPath)); // .txt

// 解析路徑
const pathInfo = path.parse(fullPath);
console.log('路徑資訊:', pathInfo);
// 輸出: {
//   root: '/',
//   dir: '/你的目錄/files',
//   base: 'test.txt',
//   ext: '.txt',
//   name: 'test'
// }
```