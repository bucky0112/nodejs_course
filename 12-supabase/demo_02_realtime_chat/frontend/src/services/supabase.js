import { createClient } from '@supabase/supabase-js'

// 從環境變數取得設定（Vite 使用 import.meta.env）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY). Realtime features will not work.')
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// 訂閱訊息變化
export const subscribeToMessages = (roomId, callback) => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping realtime subscription')
    return { unsubscribe: () => {} }
  }

  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    }
  }
}
