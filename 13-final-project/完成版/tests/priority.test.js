// 第 13 堂工作坊新增的功能：todo 的優先順序
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { createTodo } from './helpers.js'

describe('todo 的 priority', () => {
  it('新增時沒給，預設是 medium', async () => {
    const res = await request(app).post('/todos').send({ title: '一般的事' })

    expect(res.status).toBe(201)
    expect(res.body.priority).toBe('medium')
  })

  it('新增時可以指定 high', async () => {
    const res = await request(app).post('/todos').send({ title: '急事', priority: 'high' })

    expect(res.status).toBe(201)
    expect(res.body.priority).toBe('high')
  })

  it('PATCH 可以更新 priority', async () => {
    const todo = await createTodo()

    const res = await request(app).patch(`/todos/${todo.id}`).send({ priority: 'low' })

    expect(res.status).toBe(200)
    expect(res.body.priority).toBe('low')
  })

  it('?priority=high 只回傳高優先的 todo', async () => {
    await createTodo({ title: '急事', priority: 'high' })
    await createTodo({ title: '小事', priority: 'low' })

    const res = await request(app).get('/todos?priority=high')

    expect(res.status).toBe(200)
    expect(res.body.map((t) => t.title)).toEqual(['急事'])
  })

  it.each([
    ['新增時給不合法的值', () => request(app).post('/todos').send({ title: 'x', priority: 'urgent' })],
    ['篩選時給不合法的值', () => request(app).get('/todos?priority=urgent')],
  ])('%s 回 400', async (_label, send) => {
    const res = await send()

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('priority')
  })
})
