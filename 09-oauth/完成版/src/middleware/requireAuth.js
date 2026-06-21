import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '請帶上 Authorization: Bearer <token>' })
  }
  const token = header.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
    req.userId = Number(payload.sub)
    next()
  } catch {
    return res.status(401).json({ error: 'token 無效或已過期' })
  }
}
