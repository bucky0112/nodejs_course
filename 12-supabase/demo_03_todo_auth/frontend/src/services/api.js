import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

// Todos API
export const todosApi = {
  getAll: () => api.get('/todos'),
  getById: (id) => api.get(`/todos/${id}`),
  create: (data) => api.post('/todos', data),
  update: (id, data) => api.put(`/todos/${id}`, data),
  delete: (id) => api.delete(`/todos/${id}`)
}

export default api
