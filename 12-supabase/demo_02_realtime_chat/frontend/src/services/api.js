import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

// Rooms API
export const roomsApi = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  delete: (id) => api.delete(`/rooms/${id}`)
}

// Messages API
export const messagesApi = {
  getByRoom: (roomId) => api.get(`/rooms/${roomId}/messages`),
  create: (data) => api.post('/messages', data),
  delete: (id) => api.delete(`/messages/${id}`)
}

export default api
