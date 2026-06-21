// 保護路由的 middleware：沒登入就擋下來。
// session 裡有 userId 才算登入（登入時我們會把它寫進去）。
export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: '請先登入' })
  }
  next()
}
