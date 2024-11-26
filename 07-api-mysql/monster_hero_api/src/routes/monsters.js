const express = require('express')
const router = express.Router()
// const db = require('../configs/db')
const prisma = require('../configs/db')

// get all
router.get('/', async (req, res) => {
  try {
    // const [rows] = await db.query('SELECT * FROM monsters')
    const rows = await prisma.monsters.findMany()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// get by id
router.get('/:id', async (req, res) => {
  try {
    // const [rows] = await db.query('SELECT * FROM monsters WHERE id = ?', [
    //   req.params.id
    // ])

    // if (rows.length === 0)
    //   return res.status(404).json({ message: '找不到符合 ID' })

    // res.json(rows[0])

    const rows = await prisma.monsters.findUnique({
      where: {
        id: parseInt(req.params.id)
      }
    })

    if (!rows) return res.status(404).json({ message: '找不到符合 ID' })

    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// update
router.put('/:id', async (req, res) => {
  try {
    const { name, danger_level, description, kill_by } = req.body

    // await db.query(
    //   'UPDATE monsters SET name = ?, danger_level = ?, description = ?, kill_by = ? WHERE id = ?',
    //   [name, danger_level, description, kill_by, req.params.id]
    // )

    await prisma.monsters.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: {
        name,
        danger_level,
        description,
        kill_by
      }
    })
    res.json({ message: '更新怪物成功' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
