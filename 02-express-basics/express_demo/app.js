import express from 'express'

const app = express();
const port = 3000;

app.use(express.json());

const todos = [];

app.get('/todos', (req, res) => {
  res.json(todos)
})

app.post('/todos', (req, res) => {
  const { title } = req.body

  if (!title) {
    return res.status(400).json({ error: 'title 有問題' })
  }

  const newTodo = {
    id: Date.now(),
    title,
    completed: false,
    createdAt: new Date()
  }

  todos.push(newTodo)
  res.status(201).json(newTodo)
})

app.put('/todos/:id', (req, res) => {
  const { id } = req.params
  const { completed } = req.body

  const todo = todos.find((t) => t.id === Number(id))

  todo.completed = completed
  res.json(todo)
})

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params

  todos = todos.filter((t) => t.id !== Number(id))

  res.status(204).send()
})

app.listen(port, () => {
  console.log(`伺服器運行在 http://localhost:${port}`);
});