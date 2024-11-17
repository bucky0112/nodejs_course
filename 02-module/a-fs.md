# fs (File System) 模組

## 讀取與寫入

```
const fs = require('fs');

同步讀取檔案
try {
  const data = fs.readFileSync('test.txt', 'utf8');
  console.log('檔案內容:', data);
} catch (err) {
  console.error('讀取檔案錯誤:', err);
}

// 非同步讀取檔案
fs.readFile('test.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('讀取檔案錯誤:', err);
    return;
  }
  console.log('檔案內容:', data);
});
```

```
// 使用 Promise 版本 (推薦)
const fsPromises = require('fs').promises;

async function readAndWriteFile() {
  try {
    // 讀取檔案
    const content = await fsPromises.readFile('test.txt', 'utf8');
    // 寫入檔案
    await fsPromises.writeFile('testB.txt', content + '\n新增的內容');
    console.log('檔案處理完成');
  } catch (err) {
    console.error('檔案處理錯誤:', err);
  }
}

readAndWriteFile();
```

## 同步 vs 非同步概念解釋

### 同步（Synchronous）操作會阻塞程式執行，直到操作完成：

- 優點：程式碼易讀，執行順序明確
- 缺點：會阻塞主執行緒，影響效能

### 非同步（Asynchronous）操作不會阻塞程式執行：

- 優點：不會阻塞主執行緒，提高效能
- 缺點：需要 callback 或 Promise 處理，程式碼可能較複雜