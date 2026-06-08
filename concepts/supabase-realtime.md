# 概念卡：Supabase Realtime

> 一句話：Realtime 讓你「訂閱資料表的變化」——別人新增/修改一筆資料，你的前端即時收到通知。它是把 PostgreSQL 既有的能力包成好用的 WebSocket 訂閱。

---

## 一、它在做什麼

一般查資料是「你問一次、拿一次」。Realtime 是「**你訂閱、之後資料一變就推給你**」。適合聊天室、即時看板、多人協作的 todo——別人改了，你畫面馬上更新，不必一直重新整理。

---

## 二、澄清一個常見錯誤說法

> ⚠️ 有些教材說「Realtime 是傳統 PostgreSQL 做不到的」——**這不準確**。

PostgreSQL 本來就有 `LISTEN/NOTIFY` 和 logical replication。Supabase Realtime 正是**基於 Postgres 的 logical replication** 包裝出來的——它幫你把「資料庫的變更」轉成前端容易訂閱的 WebSocket，省去你自己架設這套。所以它的價值是「**幫你包好、開箱即用**」，不是「Postgres 做不到」。

---

## 三、怎麼用（前端）

```js
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY)

const channel = supabase
  .channel('todos-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      console.log('todos 有變動：', payload)
      // 在這裡更新你的畫面
    },
  )
  .subscribe()
```

要先在 Dashboard 把該表加入 Realtime publication（**Database → Publications**，把 `todos` 勾起來），或用 SQL：

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
```

> 註：啟用 Realtime 的位置是 **Database → Publications**（不是舊教材說的 Replication 分頁）。

---

## 四、進階提醒

`postgres_changes` 入門很好用，但在大流量/嚴格 RLS 場景有已知限制。Supabase 官方近年也推「Broadcast from Database」（用 trigger + `realtime.broadcast_changes`）。初學用 `postgres_changes` 即可，知道有更進階的選項就好。

---

## 延伸
- 訂閱用的 publishable key 與 RLS 的關係 → [概念卡：Supabase RLS](./supabase-rls.md)
