// 測試用的小工具：透過 API 建立資料，讓每個測試自己準備需要的資料。
import request from 'supertest'
import { app } from '../src/app.js'

export async function createTodo(body = {}) {
  const res = await request(app).post('/todos').send({ title: '測試用 todo', ...body })
  return res.body
}

export async function createList(name = '工作') {
  const res = await request(app).post('/lists').send({ name })
  return res.body
}

export async function createTag(name = '急件') {
  const res = await request(app).post('/tags').send({ name })
  return res.body
}
