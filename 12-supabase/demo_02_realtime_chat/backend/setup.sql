-- 在 Supabase SQL Editor 中執行此腳本來建立資料表

-- 建立 rooms 表
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立 messages 表
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 Realtime（重要！）
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 插入測試資料
INSERT INTO rooms (name) VALUES ('General'), ('Random');
