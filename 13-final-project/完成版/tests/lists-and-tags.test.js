import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { createTodo, createList, createTag } from './helpers.js'

describe('/lists', () => {
  it('新增清單回 201', async () => {
    const res = await request(app).post('/lists').send({ name: '工作' })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ id: expect.any(Number), name: '工作' })
  })

  it('缺 name 回 400', async () => {
    const res = await request(app).post('/lists').send({})

    expect(res.status).toBe(400)
  })

  it('GET /lists/:id 帶出底下的 todo', async () => {
    const list = await createList()
    await createTodo({ title: '寫報告', listId: list.id })

    const res = await request(app).get(`/lists/${list.id}`)

    expect(res.status).toBe(200)
    expect(res.body.todos.map((t) => t.title)).toEqual(['寫報告'])
  })

  it('刪除清單後，todo 還在、list 變成 null', async () => {
    const list = await createList()
    const todo = await createTodo({ listId: list.id })

    const res = await request(app).delete(`/lists/${list.id}`)
    expect(res.status).toBe(204)

    const after = await request(app).get(`/todos/${todo.id}`)
    expect(after.status).toBe(200)
    expect(after.body.list).toBeNull()
  })
})

describe('/tags', () => {
  it('新增標籤回 201，同名第二次回 409', async () => {
    const first = await request(app).post('/tags').send({ name: '急件' })
    expect(first.status).toBe(201)

    const second = await request(app).post('/tags').send({ name: '急件' })
    expect(second.status).toBe(409)
  })
})

describe('/todos/:id/tags', () => {
  it('貼標籤回 201，todo 的 tags 有它', async () => {
    const todo = await createTodo()
    const tag = await createTag('急件')

    const res = await request(app).post(`/todos/${todo.id}/tags`).send({ tagId: tag.id })

    expect(res.status).toBe(201)
    expect(res.body.tags).toEqual([{ id: tag.id, name: '急件' }])
  })

  it('貼不存在的標籤回 404', async () => {
    const todo = await createTodo()

    const res = await request(app).post(`/todos/${todo.id}/tags`).send({ tagId: 999 })

    expect(res.status).toBe(404)
  })

  it('撕標籤回 204，再撕一次回 404', async () => {
    const todo = await createTodo()
    const tag = await createTag()
    await request(app).post(`/todos/${todo.id}/tags`).send({ tagId: tag.id })

    const first = await request(app).delete(`/todos/${todo.id}/tags/${tag.id}`)
    expect(first.status).toBe(204)

    const second = await request(app).delete(`/todos/${todo.id}/tags/${tag.id}`)
    expect(second.status).toBe(404)
  })
})
