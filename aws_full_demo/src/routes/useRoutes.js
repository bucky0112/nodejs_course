import express from 'express'
import { deleteFile, uploadFile, getFiles, createUser } from '../controllers/useController.js'
import { upload } from '../config/s3.js'

const router = express.Router()

// 上傳檔案
router.post('/upload', upload.single('image'), uploadFile)

// 拿全部檔案
router.get('/files', getFiles)

// 刪除某一個檔案
router.delete('/files/:key', deleteFile)

// 新增 user
router.post('/createuser', createUser)

export default router
