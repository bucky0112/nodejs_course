import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// 用 publishable key 即可（受 RLS 限制）；訂閱不需要 secret key。
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY)

console.log('開始監聽 todos 表的變化…（在 Supabase 後台或別的 client 新增/修改 todo 試試）')

const channel = supabase
  .channel('todos-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      console.log(`[${payload.eventType}]`, payload.new ?? payload.old)
    },
  )
  .subscribe((status) => {
    console.log('訂閱狀態：', status)
  })

// 優雅關閉
process.on('SIGINT', async () => {
  await supabase.removeChannel(channel)
  process.exit(0)
})
