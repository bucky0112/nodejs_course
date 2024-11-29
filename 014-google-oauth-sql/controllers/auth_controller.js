const { PrismaClient } = require('@prisma/client')
const { hashPassword, comparePassword, generateToken } = require('../utils/auth_util')

const prisma = new PrismaClient()

// 註冊
const register = async (email, username, password) => {
  const hashedPassword = await hashPassword(password)

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          email,
          username
        }
      })

      await tx.user_auths.create({
        data: {
          user_id: user.id,
          auth_type: 'local',
          auth_email: email,
          password_hash: hashedPassword
        }
      })

      return user
    })

    return { token: generateToken(result.id), user: result }
  } catch (err) {
    if (err.code === 'P2002') {
      return { error: 'Email 或 username 重複' }
    }
    return { error: err.message }
  }
}

// 登入
const login = async (email, password) => {
  const auth = await prisma.user_auths.findFirst({
    where: {
      auth_email: email,
      auth_type: 'local' // 註冊類型，local 是本地註冊，google 是 Google 註冊
    },
    include: {
      users: true // 代表回傳 users 資料
    }
  })

  if (!auth || !auth.password_hash) {
    return { error: 'email 或密碼錯誤' }
  }

  const isPasswordValid = await comparePassword(password, auth.password_hash)
  if (!isPasswordValid) {
    return { error: '密碼不正確' }
  }

  await prisma.user_auths.update({
    where: { id: auth.id },
    data: { last_login: new Date() }
  })

  return {
    token: generateToken(auth.users.id),
    user: auth.users
  }
}

// Google 登入
const googleLogin = async (profile) => {
  try {
    let auth = await prisma.user_auths.findFirst({
      where: {
        auth_provide: 'google',
        auth_provide_id: profile.id.toString()
      },
      include: {
        users: true
      }
    })

    if (auth) {
      await prisma.user_auths.update({
        where: { id: auth.id },
        data: { last_login: new Date() }
      })
      return { token: generateToken(auth.users.id), user: auth.users }
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          email: profile.emails[0].value,
          username: profile.displayName
        }
      })

      await tx.user_auths.create({
        data: {
          user_id: user.id,
          auth_type: 'oauth',
          auth_provide: 'google',
          auth_provide_id: profile.id.toString(),
          auth_email: profile.emails[0].value,
          last_login: new Date()
        }
      })

      return user
    })

    return { token: generateToken(result.id), user: result }
  } catch (error) {
    return { error: error.message }
  }
}

module.exports = {
  register,
  login,
  googleLogin
}
