import { supabase } from '../config/supabase.js'

export const roomService = {
  async findAll() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(data) {
    const { data: room, error } = await supabase
      .from('rooms')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return room
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
