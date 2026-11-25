// controller：只碰 HTTP。從 req 拿參數、呼叫 service、決定狀態碼、回 res。
// 這裡不寫 try/catch：Express 5 會自動把 async 函式拋出的錯誤轉給 errorHandler。
import * as todosService from '../services/todos.service.js'

export async function list(req, res) {
  res.json(await todosService.listTodos({ completed: req.query.completed }))
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
