# Supabase Realtime 即時訂閱

本章節搭配 **Demo 2: Realtime Chat** 學習如何使用 Supabase 的即時資料訂閱功能。

## 什麼是 Realtime？

傳統的 Web 應用需要使用者手動重新整理頁面才能看到新資料。Supabase Realtime 讓你可以：

- **即時接收資料變更**：當資料庫有新增、更新、刪除時，前端自動收到通知
- **不需自己實作 WebSocket**：Supabase 幫你處理所有連線管理
- **彈性訂閱**：可以訂閱特定表格、特定條件的資料變更

## 啟用 Realtime

### 1. 在 Supabase Dashboard 啟用

1. 前往 **Database** > **Replication**
2. 找到你想啟用 Realtime 的表格
3. 點擊開關啟用

### 2. 使用 SQL 啟用

```sql
-- 啟用特定表格的 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 查看已啟用的表格
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

## Demo 2 專案結構

```
demo_02_realtime_chat/
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── setup.sql              ← 資料表建立腳本
│   └── src/
│       ├── config/supabase.js ← Supabase JS Client
│       ├── services/          ← 使用 JS Client 操作資料
│       └── ...
└── frontend/
    ├── src/
    │   ├── services/
    │   │   ├── api.js         ← 呼叫後端 API
    │   │   └── supabase.js    ← Realtime 訂閱
    │   └── views/
    │       └── ChatView.vue   ← 訂閱訊息變化
    └── ...
```

## 設定資料庫

在 Supabase SQL Editor 執行 `setup.sql`：

```sql
-- 建立 rooms 表
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立 messages 表
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 Realtime（重要！）
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## 使用 Supabase JS Client

### 後端：CRUD 操作

```javascript
// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
)
```

```javascript
// src/services/messageService.js
import { supabase } from '../config/supabase.js'

export const messageService = {
  async findByRoomId(roomId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async create(data) {
    const { data: message, error } = await supabase
      .from('messages')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return message
  }
}
```

### 前端：Realtime 訂閱

```javascript
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

// 訂閱訊息變化
export const subscribeToMessages = (roomId, callback) => {
  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',           // 監聽新增事件
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`  // 只監聽特定聊天室
      },
      (payload) => {
        callback(payload.new)      // 新資料
      }
    )
    .subscribe()

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    }
  }
}
```

### Vue 元件中使用

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { subscribeToMessages } from '../services/supabase.js'

const messages = ref([])
let subscription = null

onMounted(() => {
  // 訂閱新訊息
  subscription = subscribeToMessages(roomId, (newMessage) => {
    messages.value.push(newMessage)
  })
})

onUnmounted(() => {
  // 離開時取消訂閱
  if (subscription) {
    subscription.unsubscribe()
  }
})
</script>
```

## Realtime 事件類型

| 事件 | 說明 | payload |
|------|------|---------|
| `INSERT` | 新增資料 | `payload.new` |
| `UPDATE` | 更新資料 | `payload.new`, `payload.old` |
| `DELETE` | 刪除資料 | `payload.old` |
| `*` | 所有事件 | 依事件類型 |

### 監聽多種事件

```javascript
supabase
  .channel('messages')
  .on('postgres_changes', { event: 'INSERT', ... }, handleInsert)
  .on('postgres_changes', { event: 'DELETE', ... }, handleDelete)
  .subscribe()
```

## 啟動 Demo 2

### 1. 設定環境變數

```bash
# backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
PORT=3001

# frontend/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 2. 建立資料表

在 Supabase SQL Editor 執行 `backend/setup.sql`

### 3. 啟動後端

```bash
cd demo_02_realtime_chat/backend
npm install
npm run dev
```

### 4. 啟動前端

```bash
cd demo_02_realtime_chat/frontend
npm install
npm run dev
```

### 5. 測試 Realtime

1. 開啟兩個瀏覽器視窗
2. 用不同名字進入同一個聊天室
3. 在一邊發送訊息，另一邊應該立即收到

## 重點整理

- 啟用 Realtime 需要執行 `ALTER PUBLICATION supabase_realtime ADD TABLE ...`
- 使用 `supabase.channel().on().subscribe()` 訂閱資料變更
- 可以用 `filter` 參數只監聽特定條件的資料
- 離開頁面時記得呼叫 `unsubscribe()` 避免記憶體洩漏
- Realtime 是 Supabase 最強大的特色之一，傳統 PostgreSQL 無法做到

下一章，我們將學習 Supabase Auth 認證系統！
