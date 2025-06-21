import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { toyService } from './toy.service.js'

export async function getToys(req, res) {
  const { filterBy = {}, pageIdx } = req.query
  console.log('req.query:',req.query)

  try {
    const { toys, totalCount, PAGE_SIZE } = await toyService.query(filterBy, pageIdx)

    res.send({ toys, totalCount, PAGE_SIZE })
  } catch (error) {
    logger.error('Cannot load toys', error)
    res.status(400).send('Cannot load toys')
  }
}

export async function getToyById(req, res) {
  console.log(req.params.toyId)

  try {
    const { toyId } = req.params
    const toy = await toyService.getById(toyId)
    res.send(toy)
  } catch (error) {
    logger.error('Cannot get toy', error)
    res.status(500).send(error)
  }
}

export async function addToy(req, res) {
  const { loggedinUser } = req

  const { name, price, labels } = req.body
  const toy = {
    name,
    price: +price,
    labels,
    owner: loggedinUser,
  }
  try {
    const savedToy = await toyService.addToy(toy)
    res.send(savedToy)
  } catch (error) {
    logger.error('Cannot add toy', error)
    res.status(400).send('Cannot add toy')
  }
}

export async function updateToy(req, res) {
  try {
    const { name, price, labels, inStock, _id } = req.body
    const toy = {
      _id,
      name,
      price,
      labels,
      inStock,
    }
    const savedToy = await toyService.updateToy(toy)
    res.send(savedToy)
  } catch (error) {
    logger.error('Cannot add toy', error)
    res.status(400).send('Cannot add toy')
  }
}

export async function removeToy(req, res) {
  try {
    const { toyId } = req.params
    const deletedCount = await toyService.remove(toyId)
    res.send(`${deletedCount} toys removed `)
  } catch (error) {
    logger.error('Cannot delete toy', error)
    res.status(400).send('Cannot delete toy, ' + error)
  }
}

export async function addToyMsg(req, res) {
  console.log('GETTING HERE THE MSG')
  const { loggedinUser } = req
  const { toyId } = req.params
  try {
    const msg = {
      txt: req.body.txt,
      by: loggedinUser,
      createdAt: Date.now(),
    }
    const savedMsg = await toyService.addToyMsg(toyId, msg)
    res.send(savedMsg)
  } catch (error) {
    logger.error('Failed to update toy', error)
    res.status(500).send({ error: 'Failed to update toy' })
  }
}

export async function removeToyMsg(req, res) {
  try {
    const { toyId, msgId } = req.params
    const removedId = await toyService.removeToyMsg(toyId, msgId)

    res.send(removedId)
  } catch (error) {
    logger.error('Failed to remove toy msg', error)
    res.status(500).send({ error: 'Failed to remove toy msg' })
  }
}

export async function getStats(req, res) {
  try {
    const stats = await toyService.getStats()
    res.send(stats)
  } catch (error) {
    logger.error('Cannot load stats', error)
    res.status(400).send('Cannot load stats')
  }
}
export async function getLabels(req, res) {
  try {
    const labels = await toyService.getLabels()
    res.send(labels)
  } catch (error) {
    logger.error('Cannot get labels', error)
    res.status(400).send(error)
  }
}
export async function getLabelsCount(req, res) {
  try {
    const labelsCount = await toyService.getLabelsCount()
    res.send(labelsCount)
  } catch (error) {
    logger.error('Cannot get labels count', error)
    res.status(400).send(error)
  }
}
