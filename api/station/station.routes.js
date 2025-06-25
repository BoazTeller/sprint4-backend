import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import {
  getStations,
  getStationById,
  // getLabelsCount,
  // getLabels,
  addStation,
  // getStats,
  updateStation,
  removeStation,
  addStationMsg,
  removeStationMsg,
} from './station.controller.js'

export const stationRoutes = express.Router()
//toys
stationRoutes.get('/', log, getStations)

//get toy by id
stationRoutes.get('/:stationId', getStationById)
//add toy
stationRoutes.post('/', requireAuth, addStation)
//update toy
stationRoutes.put('/:stationId', requireAuth, updateStation)
//delete
stationRoutes.delete('/:stationId', requireAdmin, requireAuth, removeStation)

// msgs
stationRoutes.post('/:stationId/msg', requireAuth, addStationMsg)
stationRoutes.delete('/:stationId/msg', requireAdmin, requireAuth, removeStationMsg)

//dashboard
// stationRoutes.get('/dashboard', getStats)
//get labels
// stationRoutes.get('/labels', getLabels)
//get stats
// stationRoutes.get('/labels/count', getLabelsCount)
