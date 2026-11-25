import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('POST /notes', () => {
  it('新增成功回 201，pinned 預設 false', async () => {
    const res = await request(app).post('/notes').send({ text: '開會' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ text: '開會', pinned: false })
  })

  it.each([
    ['缺 text', {}],
    ['text 是空字串', { text: '   ' }],
    ['pinned 不是布林值', { text: '開會', pinned: 'yes' }],
  ])('%s 回 400', async (_label, body) => {
    const res = await request(app).post('/notes').send(body)

    expect(res.status).toBe(400)
    expect(res.body.error).toEqual(expect.any(String))
  })
})

describe('GET /notes', () => {
  it('回傳 200 與陣列', async () => {
    const res = await request(app).get('/notes')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('找不到的 id 回 404', async () => {
    const res = await request(app).get('/notes/999')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: '找不到這則筆記' })
  })
})

describe('PATCH /notes/:id', () => {
  it('可以切換 pinned', async () => {
    const res = await request(app).patch('/notes/1').send({ pinned: true })

    expect(res.status).toBe(200)
    expect(res.body.pinned).toBe(true)
  })

  it('什麼欄位都沒給回 400', async () => {
    const res = await request(app).patch('/notes/1').send({})

    expect(res.status).toBe(400)
  })

  it('id 不存在時先回 404', async () => {
    const res = await request(app).patch('/notes/999').send({ pinned: 'yes' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /notes/:id', () => {
  it('刪除成功回 204，再刪一次回 404', async () => {
    const created = await request(app).post('/notes').send({ text: '等一下就刪' })

    const first = await request(app).delete(`/notes/${created.body.id}`)
    expect(first.status).toBe(204)

    const second = await request(app).delete(`/notes/${created.body.id}`)
    expect(second.status).toBe(404)
  })
})
