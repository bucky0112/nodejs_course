import { pgTable, serial, varchar, char, integer, text, foreignKey } from 'drizzle-orm/pg-core'

// 英雄表
const heroesTable = pgTable("heroes", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  gender: char({ length: 1 }),
  age: integer(),
  heroLevel: char("hero_level", { length: 1 }).notNull(),
  heroRank: integer("hero_rank"),
  description: text()
})

// 怪物表
const monstersTable = pgTable(
  "monsters",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    dangerLevel: char("danger_level", { length: 1 }).notNull(),
    killBy: integer("kill_by"),
    description: text()
  },
  (table) => [
    foreignKey({
      columns: [table.killBy],
      foreignColumns: [heroesTable.id],
      name: "fk_kill_by"
    })
      .onUpdate("restrict")
      .onDelete("set null")
  ]
)

/* const monstersTable = pgTable('monsters', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  dangerLevel: char("danger_level", { length: 1 }).notNull(),
  description: text(),
  killBy: integer("kill_by").references(() => heroesTable.id),
}); */

export { heroesTable, monstersTable }
