import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 跑全部測試之前執行一次：把 migration 套用到測試資料庫
    globalSetup: ['./tests/global-setup.js'],
    // 每個測試檔執行前載入：改用測試資料庫、每個測試前清空資料
    setupFiles: ['./tests/setup.js'],
    // 所有測試檔共用同一個測試資料庫，一次只跑一個檔，避免互相清掉對方的資料
    fileParallelism: false,
  },
})
