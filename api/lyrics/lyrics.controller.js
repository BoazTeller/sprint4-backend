// import { getLyricsFromGenius } from '../../services/genius.service.js'

// export async function getLyrics(req, res) {
//     try {
//         const { artist, title } = req.query
//         if (!artist || !title) {
//             return res.status(400).json({ error: 'Missing artist or title' })
//         }
//         console.log('test')
//         const lyrics = await getLyricsFromGenius(artist, title)
//         res.json({ lyrics })
//     } catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// }


import { getLyricsFromGenius } from '../../services/genius.service.js'

export async function getLyrics(req, res) {
    try {
        const { artist, title } = req.query
        if (!artist || !title) {
            return res.status(400).json({ error: 'Missing artist or title' })
        }

        console.log(`🎵 Fetching lyrics for: ${artist} - ${title}`)
        const lyrics = await getLyricsFromGenius(artist, title)

        if (!lyrics) {
            return res.status(404).json({ error: 'Lyrics not found or blocked by Genius' })
        }

        res.json({ lyrics })
    } catch (err) {
        console.error('❌ getLyrics error:', err.message)
        res.status(500).json({ error: 'Lyrics server error' })
    }
}
