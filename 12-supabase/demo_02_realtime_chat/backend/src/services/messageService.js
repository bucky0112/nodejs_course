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
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
