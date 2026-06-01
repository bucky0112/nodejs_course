import { supabase } from '../config/supabase.js'

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid authorization header'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    // 驗證 JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      })
    }

    // 將使用者資訊附加到 request
    req.user = user
    req.accessToken = token

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    })
  }
}
