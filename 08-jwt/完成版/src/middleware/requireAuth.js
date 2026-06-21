import jwt from 'jsonwebtoken'

// 從 Authorization header 取出 JWT、驗章，通過才放行。
export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '請帶上 Authorization: Bearer <token>' })
  }

  const token = header.slice('Bearer '.length)
  try {
    // 重點 1：一定用 verify（驗章），不能只用 decode——decode 不檢查簽名，任何人都能偽造。
    // 重點 2：固定指定 algorithms，避免「演算法混淆 / alg:none」攻擊。
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
    req.userId = Number(payload.sub)
    next()
  } catch {
    return res.status(401).json({ error: 'token 無效或已過期' })
  }
}
