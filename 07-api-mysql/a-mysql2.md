## mysql2 的主要特點

- 支援 Promise API，可以使用 async/await
- 效能優於 mysql 模組
- 支援預處理語句（Prepared Statements）
- 內建防止 SQL 注入
- 支援連線池（Connection Pool）

## 連線池的優勢

- 重複使用資料庫連線
- 減少連線建立和關閉的開銷
- 自動管理連線
- 提升程式效能