# Node.js 非同步機制

Node.js 提供多種處理非同步操作的方式，從早期的回呼函式 (Callback) 到現代的 async/await。以下說明這些非同步處理方式。

## 1. 回呼函式 (Callback)

Callback 是最基本的非同步處理方式，透過將函式當作參數傳入另一個函式來處理異步操作。

### 1.1 模擬範例

```javascript
// 模擬讀取檔案
function readFileMock(filename, callback) {
  setTimeout(() => {
    const content = `Content of ${filename}`;
    callback(null, content);
  }, 1000);
}

readFileMock('example.txt', (err, data) => {
  if (err) {
    console.error('錯誤：', err);
    return;
  }
  console.log('模擬內容：', data);
});
```

### 1.2 實作範例（fs.readFile）

```
import fs from 'node:fs';

fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('讀檔錯誤：', err);
    return;
  }
  console.log('實際內容：', data);
});
```

### 特點
- 簡單直接
- 容易理解
- 可能導致 Callback Hell
- 錯誤處理較為複雜

## 2. Promise

Promise 是 ES6 引入的非同步處理方式，提供了更好的錯誤處理和鏈式調用能力。

### 2.1 模擬範例

```javascript
// 模擬讀取文件
function readFilePromiseMock(filename) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Content of ${filename}`);
    }, 1000);
  });
}

readFilePromiseMock('example.txt')
  .then(data => console.log('模擬內容：', data))
  .catch(err => console.error('錯誤：', err));

console.log('測試 Promise')
```

> 輸出順序：先 測試 Promise，再 模擬內容：...，因為 Promise 是非同步執行。

### 2.2 實作範例（fs.promises）

```
import fs from 'node:fs/promises';

async function demo() {
  try {
    const data = await fs.readFile('example.txt', 'utf8');
    console.log('實際內容：', data);
  } catch (err) {
    console.error('讀檔錯誤：', err);
  }
}

demo();
console.log('測試 async/await')
```

> 輸出順序：先 測試 async/await，再 實際內容：...，因為 demo() 內部的 await 在外部 console.log 之後執行。

### 2.3 同步範例（fs.readFileSync）

```
import fsSync from 'node:fs';

try {
  const data = fsSync.readFileSync('example.txt', 'utf8');
  console.log('同步讀取內容：', data);
} catch (err) {
  console.error('同步讀檔錯誤：', err);
}
console.log('測試同步')
```

> 輸出順序：先 同步讀取內容：...，再 測試同步，因為 readFileSync 會阻塞直到讀取完成。

### 特點
- 更好的錯誤處理
- 支援鏈式調用
- 避免回調地獄
- 可以並行處理多個 Promise

## async/await

async/await 是建立在 Promise 之上的語法糖，讓非同步代碼看起來更像同步代碼。

### 基本語法

```javascript
import fs from 'node:fs/promises';

async function readFiles() {
  try {
    const data1 = await fs.readFile('file1.txt', 'utf8');
    console.log('第一個檔案：', data1);

    const data2 = await fs.readFile('file2.txt', 'utf8');
    console.log('第二個檔案：', data2);
  } catch (err) {
    console.error('讀檔錯誤：', err);
  }
}

readFiles();
```

並行讀取：

```
async function readFilesParallel() {
  try {
    const [file1, file2] = await Promise.all([
      fs.readFile('file1.txt', 'utf8'),
      fs.readFile('file2.txt', 'utf8')
    ]);
    console.log('file1：', file1);
    console.log('file2：', file2);
  } catch (err) {
    console.error('讀檔錯誤：', err);
  }
}

readFilesParallel();
```

### 特點
- 簡潔易讀
- 錯誤處理更直觀
- 支援 try/catch 語法
- 可以輕鬆處理並行操作

## 選擇建議

- Callback：快速事件處理、相容舊版。

- Promise：鏈式呼叫、易於整合 async/await。

- async/await：程式碼可讀性最高，直觀錯誤處理。

## 注意事項

1. 避免過度使用 callback，可能導致 callback hell
2. Promise 和 async/await 都需要正確處理錯誤
3. 在 async 函式中，記得使用 try/catch 處理錯誤
4. 注意非同步操作的執行順序
5. 合理使用 Promise.all() 進行並行處理 

console.time() // 計算執行時間
console.timeEnd() // 結束計算
```
=== 使用 Callback 方式 ===
開始讀取檔案...
讀取 file1.txt 完成
讀取 file2.txt 完成
讀取 file3.txt 完成
總執行時間：xxx ms

=== 使用 Promise 方式 ===
開始讀取檔案...
讀取 file1.txt 完成
讀取 file2.txt 完成
讀取 file3.txt 完成
總執行時間：xxx ms

=== 使用 async/await 方式 ===
開始讀取檔案...
讀取 file1.txt 完成
讀取 file2.txt 完成
讀取 file3.txt 完成
總執行時間：xxx ms
```