import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { reviewService } from '../review/review.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
  add, // Create (Signup)
  getById, // Read (Profile page)
  update, // Update (Edit profile)
  remove, // Delete (remove user)
  query, // List (of users)
  getByUsername, // Used for Login
}

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy)
  try {
    const collection = await dbService.getCollection('user')
    var users = await collection.find(criteria).toArray()
    users = users.map(user => {
      delete user.password
      user.createdAt = user._id.getTimestamp()
      // Returning fake fresh data
      // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
      return user
    })
    return users
  } catch (err) {
    logger.error('cannot find users', err)
    throw err
  }
}
//CURRENTLY NOT HANDLING REVIEWS AT ALL - COMMENTED
// async function getById(userId) {
//     try {
//         var criteria = { _id: ObjectId.createFromHexString(userId) }

//         const collection = await dbService.getCollection('user')
//         const user = await collection.findOne(criteria)
//         delete user.password

//         criteria = { byUserId: userId }

//         user.givenReviews = await reviewService.query(criteria)
//         user.givenReviews = user.givenReviews.map(review => {
//             delete review.byUser
//             return review
//         })

//         return user
//     } catch (err) {
//         logger.error(`while finding user by id: ${userId}`, err)
//         throw err
//     }
// }

async function getById(userId) {
  try {
    const collection = await dbService.getCollection('user')
    const user = await collection.findOne(
      { _id: ObjectId.createFromHexString(userId) },
      { projection: { password: 0 } } // this method is safer then "delete user.password"
    )
    return user
  } catch (err) {
    logger.error(`while finding user by id: ${userId}`, err)
    throw err
  }
}

async function getByUsername(username) {
  try {
    const collection = await dbService.getCollection('user')
    const user = await collection.findOne({ username })

    return user
  } catch (err) {
    logger.error(`while finding user by username: ${username}`, err)
    throw err
  }
}

async function remove(userId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(userId) }

    const collection = await dbService.getCollection('user')
    await collection.deleteOne(criteria)
  } catch (err) {
    logger.error(`cannot remove user ${userId}`, err)
    throw err
  }
}

async function update(user) {
  try {

    const userToSave = {
      _id: ObjectId.createFromHexString(user._id),
      username: user.username,
      fullname: user.fullname,
      imgUrl: user.imgUrl,
      likedSongsStationId: user.likedSongsStationId,
      likedStationIds: user.likedStationIds || [],
    }

    const collection = await dbService.getCollection('user')
    await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
    return userToSave
  } catch (err) {
    loggerService.error(`cannot update user ${user._id}`, err)
    throw err
  }
}

// async function add(user) {
//     try {
//         // peek only updatable fields!
//         const userToAdd = {
//             username: user.username,
//             password: user.password,
//             fullname: user.fullname,
//             imgUrl: user.imgUrl,
//             isAdmin: user.isAdmin,
//             score: 100,
//         }
//         const collection = await dbService.getCollection('user')
//         await collection.insertOne(userToAdd)
//         return userToAdd
//     } catch (err) {
//         logger.error('cannot add user', err)
//         throw err
//     }
// }
async function add(user) {
  try {
    const userToAdd = {
      username: user.username,
      password: user.password,
      fullname: user.fullname,
      imgUrl: user.imgUrl || null,
      isAdmin: user.isAdmin ?? false,
      likedSongIds: user.likedSongIds || [],
      likedSongsStationId: user.likedSongsStationId || null,
      likedStationIds: user.likedStationIds || [],
    }
    console.log('userToAdd BEFORE INSERT:', userToAdd)
    const collection = await dbService.getCollection('user')
    const { insertedId } = await collection.insertOne(userToAdd)
    const justInserted = await collection.findOne({ _id: insertedId })
    console.log('justInserted:', justInserted)
    userToAdd._id = insertedId

    delete userToAdd.password
    return userToAdd
  } catch (err) {
    logger.error('cannot add user', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
    criteria.$or = [
      {
        username: txtCriteria,
      },
      {
        fullname: txtCriteria,
      },
    ]
  }
  // if (filterBy.minBalance) {
  //     criteria.score = { $gte: filterBy.minBalance }
  // }
  return criteria
}
