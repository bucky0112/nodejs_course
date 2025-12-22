import express from 'express'
import db from '../../db/index.js'
import { heroesTable, monstersTable } from '../../db/schema.js'
import { eq } from 'drizzle-orm'

const router = express.Router()
// get all
router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(heroesTable)
    // SELECT * FROM heroes;
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// get by id
router.get("/:id", async (req, res) => {
  try {
                                                              // (指定哪一個 table 欄位), (動態 id) 
    const rows = await db.select().from(heroesTable).where(eq(heroesTable.id, req.params.id))
    // SELECT * FROM heroes WHERE id = 動態 id
    if (!rows) return res.status(404).json({ message: "找不到符合 ID" })

    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// update
router.put("/:id", async (req, res) => {
  try {
    const { name, gender, age, heroLevel, heroRank, description } = req.body

    await db
      .update(heroesTable)
      .set({
        name,
        gender,
        age,
        heroLevel,
        heroRank,
        description
      })
      .where(eq(heroesTable.id, req.params.id))
      // UPDATE heroes
      // SET age = 10
      // WHERE id = 動態 id;
    res.json({ message: "更新英雄成功" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(heroesTable).where(eq(heroesTable.id, req.params.id))
    // DELETE FROM heroes
    // WHERE hero_level = 'A';
    res.json({ message: "成功刪除" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
