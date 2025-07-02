import express from 'express'
import { getLyrics } from './lyrics.controller.js'

const router = express.Router()

router.get('/', getLyrics)

export const lyricsRoutes = router
