import dotenv from 'dotenv'
dotenv.config() 

import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET)

export const authService = {
  signup,
  login,
  getLoginToken,
  validateToken
}

async function login(username, password) {
  logger.debug(`auth.service - login with username: ${username}`)

  //test
  const user = await userService.getByUsername(username)
  if (!user) throw new Error('Invalid username or password')

  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new Error('Invalid username or password')

  delete user.password
  
  return user
}

// async function signup({ username, password, fullname, imgUrl, isAdmin }) {
async function signup(credentials) {
  const saltRounds = 10

  logger.debug(
    `auth.service - signup with username: ${credentials.username}, fullname: ${credentials.fullname}`
  )
  if (!credentials.username || !credentials.password || !credentials.fullname)
    return Promise.reject('Missing required signup information')

  const userExist = await userService.getByUsername(credentials.username)
  if (userExist) return Promise.reject('Username already taken')
  const hash = await bcrypt.hash(credentials.password, saltRounds)
  // return userService.add({ username, password: hash, fullname, imgUrl, isAdmin })
  return userService.add({ ...credentials, password: hash })
}

function getLoginToken(user) {
  const userInfo = {
    _id: user._id,
    fullname: user.fullname,
    imgUrl: user.imgUrl,
    username: user.username,
    isAdmin: user.isAdmin,
    likedSongIds: user.likedSongIds,
    likedSongsStationId: user.likedSongsStationId,
    likedStationIds: user.likedStationIds
  }
  return cryptr.encrypt(JSON.stringify(userInfo))
}
function validateToken(loginToken) {
  try {
    const json = cryptr.decrypt(loginToken)
    const loggedinUser = JSON.parse(json)
    return loggedinUser
  } catch (err) {
    console.log('Invalid login token')
  }
  return null
}
