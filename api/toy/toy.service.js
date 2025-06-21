import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const labels = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle', 'Outdoor', 'Battery Powered']

export const toyService = {
  query,
  getById,
  remove,
  addToy,
  updateToy,
  getLabels,
  getLabelsCount,
  getStats,
  addToyMsg,
  removeToyMsg,
}

async function query(filterBy = {}, pageIdx = 0) {
  try {
    const criteria = {}
    if (filterBy.name) {
      criteria.name = { $regex: filterBy.name, $options: 'i' }
    }
    // NOTE TO MY SELF WHEN DEALING WITH NUMBERS REMEMBER TO CONVERT THEM TO NUMBER!
    if (filterBy.maxPrice) {
      criteria.price = { ...criteria.price, $lte: Number(filterBy.maxPrice) }
    }
    if (filterBy.minPrice) {
      criteria.price = { ...criteria.price, $gte: Number(filterBy.minPrice) }
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
      criteria.labels = { $all: filterBy.labels }
    }

    const { sortBy, sortDir = 1 } = filterBy
    const sortCriteria = {}

    if (sortBy) {
      sortCriteria[sortBy] = sortDir
    }

    const PAGE_SIZE = 4
    const skip = PAGE_SIZE * pageIdx

    const collection = await dbService.getCollection('toy')
    const totalCount = await collection.countDocuments(criteria)

    const toys = await collection
      .find(criteria) // find by criteria
      .sort(sortCriteria) // sort it by sortfield and dir
      .skip(skip) //skip to a certain amount
      .limit(PAGE_SIZE) // limit it to the items u decided
      .toArray() // make it array

    return {
      toys,
      totalCount,
      PAGE_SIZE,
    }
  } catch (error) {
    logger.error('couldnt find toys', error)
    throw error
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
    //getById ASK METARGEL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // if (!toy) return null
    // console.log('toy:', toy)
    // if (!(toy._id instanceof ObjectId)) {
    //     toy._id = new ObjectId(toy._id); // Convert to ObjectId if it's not
    //   }
      toy.createdAt = toy._id.getTimestamp();

    return toy
  } catch (error) {
    logger.error(`while finding toy ${toyId}`, error)
    throw error
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    // Old approach like in class =]
    const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
    //**********Newer approoach *******
    // const {deletedCount = await collection.deleteOne({_id: new ObjectId(toyId)})}

    if (deletedCount === 0) {
      throw new Error('no such toy')
    }
    return deletedCount
  } catch (error) {
    logger.error(`cannot remove toy ${toyId}`, error)
    throw error
  }
}
async function addToy(toy) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.insertOne(toy)
    return toy
  } catch (error) {
    logger.error('cannot insert toy', error)
    throw error
  }
}
async function updateToy(toy) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toy })
    return toy
  } catch (error) {
    logger.error(`cannot update toy ${toy._id}`, error)
    throw error
  }
}

async function getLabels() {
  try {
    return labels
  } catch (error) {
    logger.error(`cannot return labels`, error)
    throw error
  }
}
async function getLabelsCount() {
  try {
    const labelCounts = {}

    const collection = await dbService.getCollection('toy')
    const toys = await collection.find(criteria).toArray()

    toys.forEach(toy => {
      toy.labels.forEach(label => {
        if (!labelCounts[label]) labelCounts[label] = { total: 0, inStock: 0 }
        labelCounts[label].total++
        if (toy.inStock) labelCounts[label].inStock++
      })
    })
  } catch (error) {
    logger.error(`cannot find labelCounts`, error)
    throw error
  }
}
async function getStats() {
  const criteria = {}
  try {
    const collection = await dbService.getCollection('toy')
    const toys = await collection.find(criteria).toArray()

    const labelPriceMap = {}
    const labelCountMap = {}
    const labelInStockCountMap = {}

    toys.forEach(toy => {
      toy.labels.forEach(label => {
        // Avg price per label
        if (!labelPriceMap[label]) {
          labelPriceMap[label] = { totalPrice: 0, count: 0 }
        }
        labelPriceMap[label].totalPrice += toy.price
        labelPriceMap[label].count++

        // Inventory count per label
        if (!labelCountMap[label]) {
          labelCountMap[label] = 0
          labelInStockCountMap[label] = 0
        }
        labelCountMap[label]++
        if (toy.inStock) labelInStockCountMap[label]++
      })
    })

    const avgPricePerLabel = {}
    for (const label in labelPriceMap) {
      const { totalPrice, count } = labelPriceMap[label]
      avgPricePerLabel[label] = +(totalPrice / count).toFixed(2)
    }

    const inStockPercentByLabel = {}
    for (const label in labelCountMap) {
      const percent = (labelInStockCountMap[label] / labelCountMap[label]) * 100
      inStockPercentByLabel[label] = +percent.toFixed(2)
    }

    const lineChartData = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      lineChartData.push({
        date: date.toISOString().split('T')[0], // 'YYYY-MM-DD'
        value: Math.floor(Math.random() * 100) + 1,
      })
    }

    return {
      avgPricePerLabel,
      inStockPercentByLabel,
      lineChartData,
    }
  } catch (error) {
    logger.error(`no data was found`, error)
    throw error
  }
}

async function addToyMsg(toyId, msg) {
  try {
    msg.id = utilService.makeId()
    const collection = await dbService.getCollection('toy')
    await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
    return msg
  } catch (error) {
    logger.error(`cannot add toy msg ${toyId}`, error)
    throw error
  }
}

async function removeToyMsg(toyId, msgId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId } } })
    return msgId
  } catch (error) {
    logger.error(`cannot add toy msg ${toyId}`, error)
    throw error
  }
}
