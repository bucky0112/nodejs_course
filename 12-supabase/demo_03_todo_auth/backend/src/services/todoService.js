import { supabase } from '../config/supabase.js'

export const todoService = {
  async findByUserId(userId) {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async findById(id, userId) {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  },

  async create(data) {
    const { data: todo, error } = await supabase
      .from('todos')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return todo
  },

  async update(id, userId, data) {
    const { data: todo, error } = await supabase
      .from('todos')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return todo
  },

  async delete(id, userId) {
    const { data, error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
