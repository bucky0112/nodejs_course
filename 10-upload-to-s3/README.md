# M8 · 檔案上傳：會員頭像（S3）

> 主線章節（spine）。接續 [M7]——讓會員上傳頭像。此時 user 與登入都齊了，頭像才有歸屬。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：登入的會員能上傳頭像圖片到 AWS S3，並用安全的 presigned URL 取回顯示。

**搞懂**：
- 為什麼檔案上傳要用 multer（不是 `express.json()`）
- `memoryStorage` 直接串流上 S3、不落地暫存的好處
- 怎麼驗證檔案型別與大小（以及 mimetype 可被偽造的限制）
- S3 私有 bucket + presigned URL，以及 IAM 最小權限

---

## ② 前置檢查

- [ ] 完成 [M7]（有會員、登入、JWT）。
- [ ] 一個 AWS 帳號，建立好一個 **私有** S3 bucket。
- [ ] 一個 IAM 使用者，只給該 bucket 的 `s3:PutObject` / `s3:GetObject`（**最小權限**，不要 FullAccess）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0 | 建 bucket、IAM 最小權限、設 .env | A |
| 1 | schema 加 avatarKey、設定 multer | B |
| 2 | 上傳路由（驗型別/大小 → 串流上 S3） | C |
| 3 | 用 presigned URL 取回頭像 | D（完成版） |

完成版在 [`完成版/`](./完成版/)。

---

## ④ 概念卡

- [用 multer 處理檔案上傳](../concepts/檔案上傳-multer.md)
- [S3 與 Presigned URL](../concepts/s3-presigned-url.md) — 私有 bucket、IAM 最小權限

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試 [課堂練習](./課堂練習.md)——不看程式碼、自己把這章的「multer 接檔 → 存私有 S3 → presigned URL 取回」模式套到一個新資源 `/me/files`。練的是「能不能獨立寫出來」，跟下面的挑戰（延伸功能）分工。

### 驗收

```bash
cd 完成版
npm install
cp .env.example .env       # 填 AWS 憑證、bucket、DATABASE_URL、JWT_SECRET
npm run generate && npm run migrate
npm run dev
```

先登入拿 token，再測（`-F` 送 form-data）：

- [ ] 未登入上傳 → 401
- [ ] 沒帶檔 → 400
- [ ] 上傳非圖片（如 .txt）→ 400（fileFilter 擋下）
- [ ] 上傳超過 2MB 的圖 → 413
- [ ] 上傳合法小圖 → 201，回傳 `avatarKey`
- [ ] `GET /me/avatar` 回傳一個能開啟的 presigned URL

### 挑戰（可選）

1. 換頭像時，把舊的 S3 object 用 `DeleteObjectCommand` 刪掉，避免堆垃圾。
2. 上傳前用 magic bytes 驗證「真的是圖片」，不只信任 mimetype。
3. 限制只接受 `png`/`jpeg`/`webp`，其他副檔名拒絕。

---

**下一章 → [S2 · Supabase（雲端替代方案，進階旁支）]** 或直接看 [M9 · Railway 部署]
