import express from 'express'
import { payNewOrder, capturePaypalOrder } from '../controllers/usePaypal.js'

const router = express.Router()

router.post('/orders', payNewOrder) // 建立訂單
router.post('/orders/:orderID/capture', capturePaypalOrder) // 接收訂單

export default router
