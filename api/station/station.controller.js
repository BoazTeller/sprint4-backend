import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { stationService } from './station.service.js'

export async function getStations(req, res) {
  try {
    const { filterBy } = req.query
    const stations = await stationService.query(filterBy)

    res.send(stations)
  } catch (error) {
    logger.error('Cannot load stations', error)
    res.status(400).send('Cannot load stations')
  }
}

export async function getStationById(req, res) {
  console.log(req.params.stationId)

  try {
    const { stationId } = req.params
    const station = await stationService.getById(stationId)
    res.send(station)
  } catch (error) {
    logger.error('Cannot get station', error)
    res.status(500).send(error)
  }
}

export async function addStation(req, res) {
  const { loggedinUser } = req

  // const {body: station} =req
  console.log('req.body:', req.body)

  const { createdBy, imgUrl, likedByUsers, msgs, name, origId, songs, tags } = req.body
  const station = {
    createdBy,
    imgUrl,
    likedByUsers,
    msgs,
    name,
    origId,
    songs,
    tags,
  }
  try {
    const savedStation = await stationService.addStation(station)
    console.log('SAVEDDDDDDDDDDDDDDDDDDDDDDDD:', savedStation)
    res.send(savedStation)
  } catch (error) {
    logger.error('Cannot add station', error)
    res.status(400).send('Cannot add station')
  }
}

export async function updateStation(req, res) {
  try {
    const { _id, name, tags, songs, msgs, likedByUsers, createdBy, createdAt, imgUrl, origId } = req.body

    const station = {
      _id,
      name,
      tags,
      songs,
      msgs,
      likedByUsers,
      imgUrl,
      createdAt,
      origId: origId || '',
      createdBy: {
        _id: createdBy._id,
        fullname: createdBy.fullname,
        imgUrl: createdBy.imgUrl,
      },
    }

    const savedStation = await stationService.updateStation(station)
    console.log('UPDATEEEEEEEEEEDDDDDDDDDD:', savedStation)
    res.send(savedStation)
  } catch (error) {
    logger.error('Cannot update station', error)
    res.status(400).send('Cannot update station')
  }
}

// export async function updateStation(req, res) {
//   console.log('req.body:',req.body)
//   try {
//     const { name, price, labels, inStock, _id } = req.body
//     const station = {
//       _id,
//       name,
//       price,
//       labels,
//       inStock,
//     }
//     const savedStation = await stationService.updateStation(station)
//     res.send(savedStation)
//   } catch (error) {
//     logger.error('Cannot add station', error)
//     res.status(400).send('Cannot add station')
//   }
// }

export async function removeStation(req, res) {
  try {
    const { stationId } = req.params
    const deletedCount = await stationService.remove(stationId)
    res.send(`${deletedCount} stations removed `)
  } catch (error) {
    logger.error('Cannot delete station', error)
    res.status(400).send('Cannot delete station, ' + error)
  }
}

export async function addStationMsg(req, res) {
  console.log('GETTING HERE THE MSG')
  const { loggedinUser } = req
  const { stationId } = req.params
  try {
    const msg = {
      txt: req.body.txt,
      by: loggedinUser,
      createdAt: Date.now(),
    }
    const savedMsg = await stationService.addStationMsg(stationId, msg)
    res.send(savedMsg)
  } catch (error) {
    logger.error('Failed to update station', error)
    res.status(500).send({ error: 'Failed to update station' })
  }
}

export async function removeStationMsg(req, res) {
  try {
    const { stationId, msgId } = req.params
    const removedId = await stationService.removeStationMsg(stationId, msgId)

    res.send(removedId)
  } catch (error) {
    logger.error('Failed to remove station msg', error)
    res.status(500).send({ error: 'Failed to remove station msg' })
  }
}

export async function getStats(req, res) {
  try {
    const stats = await stationService.getStats()
    res.send(stats)
  } catch (error) {
    logger.error('Cannot load stats', error)
    res.status(400).send('Cannot load stats')
  }
}
export async function getLabels(req, res) {
  try {
    const labels = await stationService.getLabels()
    res.send(labels)
  } catch (error) {
    logger.error('Cannot get labels', error)
    res.status(400).send(error)
  }
}
export async function getLabelsCount(req, res) {
  try {
    const labelsCount = await stationService.getLabelsCount()
    res.send(labelsCount)
  } catch (error) {
    logger.error('Cannot get labels count', error)
    res.status(400).send(error)
  }
}
