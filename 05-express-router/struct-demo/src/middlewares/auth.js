function auth(req, res, next) {
  if (req.query.admin === 'true') {
    next()
    return
  }
  res.json({ message: '你沒有權限' })
}

module.exports = auth
