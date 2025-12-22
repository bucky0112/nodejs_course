import express from 'express'

const app = express()

app.use(express.json())

let messages = []

app.get('/api/messages', (req, res) => {
  res.json(messages)
})

app.post('/api/messages', (req, res) => {
  const { content, author } = req.body

  const newMsg = {
    id: Date.now().toString(),
    content,
    author
  }

  messages.push(newMsg)
  res.status(201).json(newMsg)
})

app.put('/api/messages/:id', (req, res) => {
  const { id } = req.params
  const { content } = req.body

  const msgIndex = messages.findIndex((msg) => msg.id === id)

  if (msgIndex === -1) {
    return res.status(404).json({ error: '找不到' })
  }

  messages[msgIndex] = {
    ...messages[msgIndex],
    content
  }

  res.status(200).json(messages[msgIndex])
})

app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params
  const msgIndex = messages.findIndex((msg) => msg.id === id)

  if (msgIndex === -1) {
    return res.status(404).json({ err: '找不到' })
  }

  messages = messages.filter((msg) => msg.id !== id)
  res.status(204).json({ message: '成功刪除' })
})

const port = 3000
app.listen(port, () => {
  console.log(`伺服器已啟動在 http://localhost:${port}`)
})
