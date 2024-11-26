const express = require('express')
const router = express.Router()
// const db = require('../configs/db')

const prisma = require('../configs/db')

// get all
router.get('/', async (req, res) => {
  try {
    // const [rows] = await db.query('SELECT * FROM heroes')
    const rows = await prisma.heroes.findMany()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// get by id
router.get('/:id', async (req, res) => {
  try {
    // const [rows] = await db.query('SELECT * FROM heroes WHERE id = ?', [
    //   req.params.id
    // ])

    const rows = await prisma.heroes.findUnique({
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
    const { name, gender, age, hero_level, hero_rank, description } = req.body

    // await db.query(
    //   'UPDATE heroes SET name = ?, gender = ?, age = ?, hero_level = ?, hero_rank = ?, description = ? WHERE id = ?',
    //   [name, gender, age, hero_level, hero_rank, description, req.params.id]
    // )

    await prisma.heroes.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: {
        name,
        gender,
        age,
        hero_level,
        hero_rank,
        description
      }
    })
    res.json({ message: '更新英雄成功' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    // const [result] = await db.query('DELETE FROM heroes WHERE id = ?', [
    //   req.params.id
    // ])
    await prisma.heroes.delete({
      where: {
        id: parseInt(req.params.id)
      }
    })
    res.json({ message: '成功刪除' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
