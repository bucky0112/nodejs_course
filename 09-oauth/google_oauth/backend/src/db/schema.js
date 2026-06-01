import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'

/**
 * OAuth 使用者表
 * 儲存 Google OAuth 登入的使用者資料
 */
export const usersTable = pgTable("users", {
  id: serial().primaryKey(),
  googleId: varchar("google_id", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  profilePicture: varchar("profile_picture", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login").defaultNow()
})
