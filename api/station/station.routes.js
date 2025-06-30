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

stationRoutes.get('/', log, getStations)


stationRoutes.get('/:stationId', getStationById)

stationRoutes.post('/', requireAuth, addStation)

stationRoutes.put('/:stationId', requireAuth, updateStation)

stationRoutes.delete('/:stationId', requireAuth, removeStation)
// stationRoutes.delete('/:stationId', requireAdmin, requireAuth, removeStation)


stationRoutes.post('/:stationId/msg', requireAuth, addStationMsg)
stationRoutes.delete('/:stationId/msg', requireAdmin, requireAuth, removeStationMsg)

//dashboard
// stationRoutes.get('/dashboard', getStats)
//get labels
// stationRoutes.get('/labels', getLabels)
//get stats
// stationRoutes.get('/labels/count', getLabelsCount)
