// service：驗證 + 業務邏輯 + 資料存取。不認識 req / res，只吃參數、回資料，出錯就拋 HttpError。
import { HttpError } from '../lib/httpError.js'

const notes = [{ id: 1, text: '記得買牛奶', pinned: false, createdAt: new Date().toISOString() }]
let nextId = 2

function findOrThrow(id) {
  const note = notes.find((n) => n.id === id)
  if (!note) throw new HttpError(404, '找不到這則筆記')
  return note
}

function assertText(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new HttpError(400, 'text 必填，且必須是非空字串')
  }
}

function assertPinned(pinned) {
  if (typeof pinned !== 'boolean') {
    throw new HttpError(400, 'pinned 必須是布林值')
  }
}

export async function listNotes() {
  return notes
}

export async function getNote(id) {
  return findOrThrow(id)
}

export async function createNote({ text, pinned } = {}) {
  assertText(text)
  if (pinned !== undefined) assertPinned(pinned)
  const note = {
    id: nextId++,
    text: text.trim(),
    pinned: pinned ?? false,
    createdAt: new Date().toISOString(),
  }
  notes.push(note)
  return note
}

export async function updateNote(id, { text, pinned } = {}) {
  const note = findOrThrow(id) // 先確認存在（404），再檢查欄位（400）
  if (text !== undefined) assertText(text)
  if (pinned !== undefined) assertPinned(pinned)
  if (text === undefined && pinned === undefined) {
    throw new HttpError(400, '沒有提供要更新的欄位')
  }
  if (text !== undefined) note.text = text.trim()
  if (pinned !== undefined) note.pinned = pinned
  return note
}

export async function deleteNote(id) {
  findOrThrow(id)
  notes.splice(notes.findIndex((n) => n.id === id), 1)
}
