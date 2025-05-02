const { pgTable, serial, varchar, char, integer, text } = require('drizzle-orm/pg-core');

// 英雄表
const heroesTable = pgTable('heroes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  gender: char('gender', { length: 1 }),
  age: integer('age'),
  hero_level: char('hero_level', { length: 1 }).notNull(),
  hero_rank: integer('hero_rank'),
  description: text('description'),
});

// 怪物表
const monstersTable = pgTable('monsters', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  danger_level: char('danger_level', { length: 1 }).notNull(),
  description: text('description'),
  kill_by: integer('kill_by'),

  // foreign key 約束（對應 Prisma 的 @relation）
}, (table) => ({
  fk_killer_hero: {
    columns: [table.kill_by],
    foreignColumns: [heroesTable.id],
    name: 'fk_killer_hero',
    onUpdate: 'restrict'
  },
  fk_killer_hero_idx: {
    indexName: 'fk_killer_hero_idx',
    columns: [table.kill_by]
  }
}));

module.exports = {
  heroesTable,
  monstersTable
};
