// controller：只碰 HTTP。從 req 拿參數、呼叫 service、決定狀態碼、回 res。
import * as notesService from '../services/notes.service.js'

export async function list(req, res) {
  res.json(await notesService.listNotes())
}

export async function get(req, res) {
  res.json(await notesService.getNote(Number(req.params.id)))
}

export async function create(req, res) {
  res.status(201).json(await notesService.createNote(req.body))
}

export async function update(req, res) {
  res.json(await notesService.updateNote(Number(req.params.id), req.body))
}

export async function remove(req, res) {
  await notesService.deleteNote(Number(req.params.id))
  res.status(204).send()
}
