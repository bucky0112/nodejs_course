# 📘 Schema Overview

這份資料庫設計示範的是一個簡化版的 Instagram 系統，包含以下五個資料表：

- `users`：使用者
- `posts`：貼文
- `likes`：按讚關係（`users` ⇄ `posts` 的多對多中介表）
- `follows`：追蹤關係（`users` ⇄ `users` 的多對多自關聯）
- `comments`：留言

## 🔗 資料表關聯

- 一對多（1:N）: `users` 👉 `posts`、`posts` 👉 `comments`、`users` 👉 `comments`
- 多對多（M:N）: `users` ⇄ `posts`（透過 `likes`）
- 多對多自關聯（M:N）: `users` ⇄ `users`（透過 `follows`，誰追蹤誰）

```plaintext
users ---< posts
users ---< likes   >--- posts
users ---< comments >--- posts
users ---< follows >--- users   (自關聯：follower / following)
```
