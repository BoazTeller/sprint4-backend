import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import {
  getToys,
  getToyById,
  getLabelsCount,
  getLabels,
  addToy,
  getStats,
  updateToy,
  removeToy,
  addToyMsg,
  removeToyMsg,
} from './toy.controller.js'

export const toyRoutes = express.Router()
//toys
toyRoutes.get('/', log, getToys)
//dashboard
toyRoutes.get('/dashboard', getStats)
//get labels
toyRoutes.get('/labels', getLabels)
//get stats
toyRoutes.get('/labels/count', getLabelsCount)
//get toy by id
toyRoutes.get('/:toyId', getToyById)
//add toy
toyRoutes.post('/', requireAuth, addToy)
//update toy
toyRoutes.put('/:toyId', requireAuth, updateToy)
//delete
toyRoutes.delete('/:toyId', requireAdmin, requireAuth, removeToy)

// msgs
toyRoutes.post('/:toyId/msg', requireAuth, addToyMsg)
toyRoutes.delete('/:toyId/msg', requireAdmin, requireAuth, removeToyMsg)
