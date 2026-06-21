// 這裡的 async controller 不寫 try/catch：Express 5 會自動把拋出的錯誤轉給 errorHandler。
// userId 從 session 取得（路由已掛 requireAuth，保證一定有值）。
import * as todosService from '../services/todos.service.js'

export async function list(req, res) {
  res.json(await todosService.listTodos(req.session.userId))
}

export async function get(req, res) {
  res.json(await todosService.getTodo(Number(req.params.id), req.session.userId))
}

export async function create(req, res) {
  res.status(201).json(await todosService.createTodo(req.body, req.session.userId))
}

export async function update(req, res) {
  res.json(await todosService.updateTodo(Number(req.params.id), req.body, req.session.userId))
}

export async function remove(req, res) {
  await todosService.deleteTodo(Number(req.params.id), req.session.userId)
  res.status(204).send()
}

export async function addTag(req, res) {
  res
    .status(201)
    .json(await todosService.addTagToTodo(Number(req.params.id), req.body.tagId, req.session.userId))
}

export async function removeTag(req, res) {
  await todosService.removeTagFromTodo(
    Number(req.params.id),
    Number(req.params.tagId),
    req.session.userId,
  )
  res.status(204).send()
}
