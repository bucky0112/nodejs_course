// 每個測試開始前資料庫都是空的（見 tests/setup.js），需要的資料在測試裡自己建立。
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { createTodo, createList } from './helpers.js'

describe('GET /todos', () => {
  it('回傳 200 與陣列', async () => {
    await createTodo({ title: 'A' })
    await createTodo({ title: 'B' })

    const res = await request(app).get('/todos')

    expect(res.status).toBe(200)
    expect(res.body.map((t) => t.title)).toEqual(['A', 'B'])
  })

  it('?completed=true 只回傳已完成的 todo', async () => {
    const done = await createTodo({ title: '做完了' })
    await createTodo({ title: '還沒' })
    await request(app).patch(`/todos/${done.id}`).send({ completed: true })

    const res = await request(app).get('/todos?completed=true')

    expect(res.status).toBe(200)
    expect(res.body.map((t) => t.title)).toEqual(['做完了'])
  })
})

describe('GET /todos/:id', () => {
  it('找得到回 200，帶出 list 與 tags', async () => {
    const todo = await createTodo()

    const res = await request(app).get(`/todos/${todo.id}`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: todo.id, list: null, tags: [] })
  })

  it.each(['999', 'abc'])('id 是 %s 時回 404', async (id) => {
    const res = await request(app).get(`/todos/${id}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: '找不到這筆 todo' })
  })
})

describe('POST /todos', () => {
  it('新增成功回 201，存進資料庫', async () => {
    const res = await request(app).post('/todos').send({ title: '  寫測試  ' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ title: '寫測試', completed: false, priority: 'medium' })

    const after = await request(app).get(`/todos/${res.body.id}`)
    expect(after.status).toBe(200)
  })

  it('可以指定清單', async () => {
    const list = await createList('工作')

    const res = await request(app).post('/todos').send({ title: '寫報告', listId: list.id })

    expect(res.status).toBe(201)
    expect(res.body.list).toEqual({ id: list.id, name: '工作' })
  })

  it.each([
    ['缺 title', {}],
    ['listId 不存在', { title: 'x', listId: 999 }],
    ['壞掉的 JSON', null],
  ])('%s 回 400', async (_label, body) => {
    const req = request(app).post('/todos')
    const res = body === null ? await req.set('Content-Type', 'application/json').send('{bad') : await req.send(body)

    expect(res.status).toBe(400)
    expect(res.body.error).toEqual(expect.any(String))
  })
})

describe('PATCH /todos/:id', () => {
  it('可以只更新 completed', async () => {
    const todo = await createTodo()

    const res = await request(app).patch(`/todos/${todo.id}`).send({ completed: true })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ completed: true, title: todo.title })
  })

  it('listId 給 null 可以移出清單', async () => {
    const list = await createList()
    const todo = await createTodo({ listId: list.id })

    const res = await request(app).patch(`/todos/${todo.id}`).send({ listId: null })

    expect(res.status).toBe(200)
    expect(res.body.list).toBeNull()
  })

  it('completed 不是布林值回 400', async () => {
    const todo = await createTodo()

    const res = await request(app).patch(`/todos/${todo.id}`).send({ completed: 'yes' })

    expect(res.status).toBe(400)
  })

  it('id 不存在時回 404，即使欄位也錯', async () => {
    const res = await request(app).patch('/todos/999').send({ completed: 'yes' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /todos/:id', () => {
  it('刪除成功回 204，之後查不到', async () => {
    const todo = await createTodo()

    const res = await request(app).delete(`/todos/${todo.id}`)
    expect(res.status).toBe(204)

    const after = await request(app).get(`/todos/${todo.id}`)
    expect(after.status).toBe(404)
  })

  it('刪除不存在的回 404', async () => {
    const res = await request(app).delete('/todos/999')

    expect(res.status).toBe(404)
  })
})
