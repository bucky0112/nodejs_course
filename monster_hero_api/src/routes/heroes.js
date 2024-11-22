const express = require('express')
const router = express.Router()
const db = require('../configs/db')

// get all
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM heroes')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// get by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM heroes WHERE id = ?', [
      req.params.id
    ])

    if (rows.length === 0)
      return res.status(404).json({ message: '找不到符合 ID' })

    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// update
router.put('/:id', async (req, res) => {
  try {
    const { name, gender, age, hero_level, hero_rank, description } = req.body

    await db.query(
      'UPDATE heroes SET name = ?, gender = ?, age = ?, hero_level = ?, hero_rank = ?, description = ? WHERE id = ?',
      [name, gender, age, hero_level, hero_rank, description, req.params.id]
    )
    res.json({ message: '更新英雄成功' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM heroes WHERE id = ?', [req.params.id])
    res.json({ message: '成功刪除' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
