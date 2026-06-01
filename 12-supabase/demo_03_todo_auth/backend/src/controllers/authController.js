import { supabase } from '../config/supabase.js'

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        })
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        })
      }

      res.status(201).json({
        success: true,
        data: {
          user: data.user,
          session: data.session
        },
        message: 'Registration successful. Please check your email for verification.'
      })
    } catch (error) {
      next(error)
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        })
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return res.status(401).json({
          success: false,
          error: error.message
        })
      }

      res.json({
        success: true,
        data: {
          user: data.user,
          session: data.session
        }
      })
    } catch (error) {
      next(error)
    }
  },

  async logout(req, res, next) {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        })
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error) {
      next(error)
    }
  },

  async me(req, res, next) {
    try {
      // req.user 由 authMiddleware 設定
      res.json({
        success: true,
        data: req.user
      })
    } catch (error) {
      next(error)
    }
  }
}
