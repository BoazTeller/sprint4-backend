import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const labels = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle', 'Outdoor', 'Battery Powered']

export const stationService = {
  query,
  getById,
  remove,
  addStation,
  updateStation,
  // getLabels,
  // getLabelsCount,
  // getStats,
  addStationMsg,
  removeStationMsg,
}

async function query(filterBy = {}) {
  try {
    const criteria = {}
    if (filterBy.name) {
      criteria.name = { $regex: filterBy.name, $options: 'i' }
    }
    // NOTE TO MY SELF WHEN DEALING WITH NUMBERS REMEMBER TO CONVERT THEM TO NUMBER!
    // if (filterBy.maxPrice) {
    //   criteria.price = { ...criteria.price, $lte: Number(filterBy.maxPrice) }
    // }
    // if (filterBy.minPrice) {
    //   criteria.price = { ...criteria.price, $gte: Number(filterBy.minPrice) }
    // }

    // if (filterBy.labels && filterBy.labels.length > 0) {
    //   criteria.labels = { $all: filterBy.labels }
    // }

    // const { sortBy, sortDir = 1 } = filterBy
    // const sortCriteria = {}

    // if (sortBy) {
    //   sortCriteria[sortBy] = sortDir
    // }

    // const PAGE_SIZE = 4
    // const skip = PAGE_SIZE * pageIdx

    const collection = await dbService.getCollection('station')
    const totalCount = await collection.countDocuments(criteria)

    const stations = await collection.find(criteria).toArray()
    // const stations = await collection
    //   .find(criteria) // find by criteria
    //   .sort(sortCriteria) // sort it by sortfield and dir
    //   .skip(skip) //skip to a certain amount
    //   .limit(PAGE_SIZE) // limit it to the items u decided
    //   .toArray() // make it array

    return stations
  } catch (error) {
    logger.error('couldnt find stations', error)
    throw error
  }
}

async function getById(stationId) {
  try {
    const collection = await dbService.getCollection('station')
    const station = await collection.findOne({ _id: ObjectId.createFromHexString(stationId) })
    //getById ASK METARGEL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // if (!station) return null
    // console.log('station:', station)
    // if (!(station._id instanceof ObjectId)) {
    //     station._id = new ObjectId(station._id); // Convert to ObjectId if it's not
    //   }
    station.createdAt = station._id.getTimestamp()

    return station
  } catch (error) {
    logger.error(`while finding station ${stationId}`, error)
    throw error
  }
}

async function remove(stationId) {
  try {
    const collection = await dbService.getCollection('station')
    // Old approach like in class =]
    const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(stationId) })
    //**********Newer approoach *******
    // const {deletedCount = await collection.deleteOne({_id: new ObjectId(stationId)})}

    if (deletedCount === 0) {
      throw new Error('no such station')
    }
    return deletedCount
  } catch (error) {
    logger.error(`cannot remove station ${stationId}`, error)
    throw error
  }
}
async function addStation(station) {
  try {
    const collection = await dbService.getCollection('station')
    await collection.insertOne(station)

    station.createdAt = station._id.getTimestamp()
    return station
  } catch (error) {
    logger.error('cannot insert station', error)
    throw error
  }
}

// async function updateStation(station) {
//   try {
//     const collection = await dbService.getCollection('station')
//     await collection.updateOne({ _id: ObjectId.createFromHexString(station._id) }, { $set: station })
//     return station
//   } catch (error) {
//     logger.error(`cannot update station ${station._id}`, error)
//     throw error
//   }
// }

async function updateStation(station) {
  try {
    const collection = await dbService.getCollection('station')

    const { _id, ...updateData } = station

    await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: updateData })

    return station
  } catch (error) {
    logger.error(`cannot update station ${station._id}`, error)
    throw error
  }
}

// async function getLabels() {
//   try {
//     return labels
//   } catch (error) {
//     logger.error(`cannot return labels`, error)
//     throw error
//   }
// }
// async function getLabelsCount() {
//   try {
//     const labelCounts = {}

//     const collection = await dbService.getCollection('station')
//     const stations = await collection.find(criteria).toArray()

//     stations.forEach(station => {
//       station.labels.forEach(label => {
//         if (!labelCounts[label]) labelCounts[label] = { total: 0, inStock: 0 }
//         labelCounts[label].total++
//         if (station.inStock) labelCounts[label].inStock++
//       })
//     })
//   } catch (error) {
//     logger.error(`cannot find labelCounts`, error)
//     throw error
//   }
// }
// async function getStats() {
//   const criteria = {}
//   try {
//     const collection = await dbService.getCollection('station')
//     const stations = await collection.find(criteria).toArray()

//     const labelPriceMap = {}
//     const labelCountMap = {}
//     const labelInStockCountMap = {}

//     stations.forEach(station => {
//       station.labels.forEach(label => {
//         // Avg price per label
//         if (!labelPriceMap[label]) {
//           labelPriceMap[label] = { totalPrice: 0, count: 0 }
//         }
//         labelPriceMap[label].totalPrice += station.price
//         labelPriceMap[label].count++

//         // Inventory count per label
//         if (!labelCountMap[label]) {
//           labelCountMap[label] = 0
//           labelInStockCountMap[label] = 0
//         }
//         labelCountMap[label]++
//         if (station.inStock) labelInStockCountMap[label]++
//       })
//     })

//     const avgPricePerLabel = {}
//     for (const label in labelPriceMap) {
//       const { totalPrice, count } = labelPriceMap[label]
//       avgPricePerLabel[label] = +(totalPrice / count).toFixed(2)
//     }

//     const inStockPercentByLabel = {}
//     for (const label in labelCountMap) {
//       const percent = (labelInStockCountMap[label] / labelCountMap[label]) * 100
//       inStockPercentByLabel[label] = +percent.toFixed(2)
//     }

//     const lineChartData = []
//     const now = new Date()
//     for (let i = 5; i >= 0; i--) {
//       const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
//       lineChartData.push({
//         date: date.toISOString().split('T')[0], // 'YYYY-MM-DD'
//         value: Math.floor(Math.random() * 100) + 1,
//       })
//     }

//     return {
//       avgPricePerLabel,
//       inStockPercentByLabel,
//       lineChartData,
//     }
//   } catch (error) {
//     logger.error(`no data was found`, error)
//     throw error
//   }
// }

async function addStationMsg(stationId, msg) {
  try {
    msg.id = utilService.makeId()
    const collection = await dbService.getCollection('station')
    await collection.updateOne({ _id: ObjectId.createFromHexString(stationId) }, { $push: { msgs: msg } })
    return msg
  } catch (error) {
    logger.error(`cannot add station msg ${stationId}`, error)
    throw error
  }
}

async function removeStationMsg(stationId, msgId) {
  try {
    const collection = await dbService.getCollection('station')
    await collection.updateOne({ _id: ObjectId.createFromHexString(stationId) }, { $pull: { msgs: { id: msgId } } })
    return msgId
  } catch (error) {
    logger.error(`cannot add station msg ${stationId}`, error)
    throw error
  }
}
