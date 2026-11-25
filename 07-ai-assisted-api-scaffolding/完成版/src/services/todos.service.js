// service：業務邏輯 + 驗證 + 資料存取。不認識 req / res，只吃參數、回資料，出錯就拋 HttpError。
// 資料先存在記憶體；第 11 堂會把這裡換成 Prisma，controller 和 routes 都不用改。
import { HttpError } from '../lib/httpError.js'

const todos = [
  { id: 1, title: '學會 Express', completed: false, createdAt: new Date().toISOString() },
  { id: 2, title: '搞懂路由', completed: true, createdAt: new Date().toISOString() },
]
let nextId = 3

function findOrThrow(id) {
  const todo = todos.find((t) => t.id === id)
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  return todo
}

function assertTitle(title) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new HttpError(400, 'title 必填，且必須是非空字串')
  }
}

export async function listTodos({ completed } = {}) {
  if (completed === undefined) return todos
  return todos.filter((t) => String(t.completed) === completed)
}

export async function getTodo(id) {
  return findOrThrow(id)
}

export async function createTodo({ title } = {}) {
  assertTitle(title)
  const todo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  }
  todos.push(todo)
  return todo
}

export async function updateTodo(id, { title, completed } = {}) {
  const todo = findOrThrow(id) // 先確認存在（404），再檢查欄位（400）
  if (title !== undefined) {
    assertTitle(title)
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    throw new HttpError(400, 'completed 必須是布林值')
  }
  if (title === undefined && completed === undefined) {
    throw new HttpError(400, '沒有提供要更新的欄位')
  }
  if (title !== undefined) todo.title = title.trim()
  if (completed !== undefined) todo.completed = completed
  return todo
}

export async function deleteTodo(id) {
  findOrThrow(id)
  const index = todos.findIndex((t) => t.id === id)
  todos.splice(index, 1)
}
