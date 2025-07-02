import { getLyricsFromGenius } from '../../services/genius.service.js'

export async function getLyrics(req, res) {
    try {
        const { artist, title } = req.query
        if (!artist || !title) {
            return res.status(400).json({ error: 'Missing artist or title' })
        }
        console.log('test')
        const lyrics = await getLyricsFromGenius(artist, title)
        res.json({ lyrics })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
