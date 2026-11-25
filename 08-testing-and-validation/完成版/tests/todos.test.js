// 用 supertest 直接對 app 發 HTTP 請求：import 的是 app.js，不是 server.js，所以不會真的開 port。
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('GET /todos', () => {
  it('回傳 200 與陣列', async () => {
    const res = await request(app).get('/todos')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('?completed=true 只回傳已完成的 todo', async () => {
    const res = await request(app).get('/todos?completed=true')

    expect(res.status).toBe(200)
    expect(res.body.every((todo) => todo.completed === true)).toBe(true)
  })
})

describe('GET /todos/:id', () => {
  it('找得到回 200', async () => {
    const res = await request(app).get('/todos/1')

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(1)
  })

  it('找不到回 404 與錯誤訊息', async () => {
    const res = await request(app).get('/todos/999')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: '找不到這筆 todo' })
  })
})

describe('POST /todos', () => {
  it('新增成功回 201，回傳新的 todo', async () => {
    const res = await request(app).post('/todos').send({ title: '  寫測試  ' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ title: '寫測試', completed: false })
    expect(res.body.id).toEqual(expect.any(Number))
  })

  it('缺 title 回 400', async () => {
    const res = await request(app).post('/todos').send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toEqual(expect.any(String))
  })

  it('壞掉的 JSON 回 400', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Content-Type', 'application/json')
      .send('{bad')

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: '請求的 JSON 格式錯誤' })
  })
})

describe('PATCH /todos/:id', () => {
  it('可以只更新 completed', async () => {
    const res = await request(app).patch('/todos/1').send({ completed: true })

    expect(res.status).toBe(200)
    expect(res.body.completed).toBe(true)
  })

  it('completed 不是布林值回 400', async () => {
    const res = await request(app).patch('/todos/1').send({ completed: 'yes' })

    expect(res.status).toBe(400)
  })

  it('id 不存在時回 404，即使欄位也錯', async () => {
    const res = await request(app).patch('/todos/999').send({ completed: 'yes' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /todos/:id', () => {
  it('刪除成功回 204，之後查不到', async () => {
    const created = await request(app).post('/todos').send({ title: '等一下就刪' })

    const res = await request(app).delete(`/todos/${created.body.id}`)
    expect(res.status).toBe(204)

    const after = await request(app).get(`/todos/${created.body.id}`)
    expect(after.status).toBe(404)
  })

  it('刪除不存在的回 404', async () => {
    const res = await request(app).delete('/todos/999')

    expect(res.status).toBe(404)
  })
})
