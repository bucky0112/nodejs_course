import { createSupabaseClient } from '../config/supabase.js'

// 每個方法都用「帶使用者 access token」的 client，
// 這樣 Supabase 的 auth.uid() 才會等於登入者，setup.sql 啟用的
// RLS 政策（auth.uid() = user_id）才會放行；若用匿名 client，
// auth.uid() 為 NULL，所有 CRUD 都會被 RLS 擋下、demo 無法運作。
export const todoService = {
  async findByUserId(accessToken, userId) {
    const supabase = createSupabaseClient(accessToken)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async findById(accessToken, id, userId) {
    const supabase = createSupabaseClient(accessToken)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle() // 查無資料回 data=null（而非 .single() 丟 PGRST116），讓 controller 能回 404

    if (error) throw error
    return data
  },

  async create(accessToken, data) {
    const supabase = createSupabaseClient(accessToken)
    const { data: todo, error } = await supabase
      .from('todos')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return todo
  },

  async update(accessToken, id, userId, data) {
    const supabase = createSupabaseClient(accessToken)
    const { data: todo, error } = await supabase
      .from('todos')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle() // 查無資料回 null，讓 controller 能回 404

    if (error) throw error
    return todo
  },

  async delete(accessToken, id, userId) {
    const supabase = createSupabaseClient(accessToken)
    const { data, error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle() // 查無資料回 null，讓 controller 能回 404

    if (error) throw error
    return data
  }
}
