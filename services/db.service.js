import { MongoClient } from 'mongodb'

import { config } from '../config/index.js'
import { logger } from './logger.service.js'

let dbConn = null

export const dbService = { 
    getCollection 
}

async function getCollection(collectionName) {
    try { 
        const db = await _connect()
        const collection = await db.collection(collectionName)
        return collection
    } catch (err) {
        logger.error(`Failed to get collection: ${collectionName}`, err)
        throw err
    }
}

async function _connect() {
    if (dbConn) return dbConn

    try {
        const client = await MongoClient.connect(config.dbURL)
        dbConn = client.db(config.dbName)
        return dbConn
    } catch (err) {
        logger.error('Database connection failed', err)
        throw err
    }
}