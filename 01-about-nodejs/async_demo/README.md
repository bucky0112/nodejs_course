# 同步 vs 非同步 檔案讀取範例

搭配講義 [`f-async-mechanisms.md`](../f-async-mechanisms.md) 使用，示範 Node.js 阻塞（同步）與非阻塞（非同步）讀檔的差異。

## 檔案說明

| 檔案 | 說明 |
|------|------|
| `sync.js` | 使用 `fs.readFileSync`，會**阻塞**主執行緒，逐一讀完才往下執行 |
| `async.js` | 使用 `fs.promises.readFile` + `Promise.all`，讀取期間執行緒不被卡住 |
| `file1.txt` / `file2.txt` | 被讀取的測試檔案 |

## 執行方式

```bash
node sync.js    # 觀察「同步」輸出順序與耗時
node async.js   # 觀察「非同步」輸出順序與耗時
```

對照兩者的 `console.log` 順序與 `console.time` 耗時，即可理解為什麼非同步能讓 I/O 期間不浪費執行緒。
