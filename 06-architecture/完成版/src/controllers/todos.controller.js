// 這裡的 async controller 不寫 try/catch：Express 5 會自動把拋出的錯誤轉給 errorHandler。
import * as todosService from '../services/todos.service.js'

export async function list(req, res) {
  res.json(await todosService.listTodos())
}

export async function get(req, res) {
  res.json(await todosService.getTodo(Number(req.params.id)))
}

export async function create(req, res) {
  res.status(201).json(await todosService.createTodo(req.body))
}

export async function update(req, res) {
  res.json(await todosService.updateTodo(Number(req.params.id), req.body))
}

export async function remove(req, res) {
  await todosService.deleteTodo(Number(req.params.id))
  res.status(204).send()
}

export async function addTag(req, res) {
  res.status(201).json(await todosService.addTagToTodo(Number(req.params.id), req.body.tagId))
}

export async function removeTag(req, res) {
  await todosService.removeTagFromTodo(Number(req.params.id), Number(req.params.tagId))
  res.status(204).send()
}
