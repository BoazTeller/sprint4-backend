import axios from 'axios'
import { load } from 'cheerio'

const GENIUS_ACCESS_TOKEN='seaw5_2TRH_81yjAbxHJevfAvE7Fdw45wekJvMR0r9JUuBN8V8xff1VzC4v0e91x'

// First - Search for the song
export async function searchGenius(artist, title) {
    const q = encodeURIComponent(`${artist} ${title}`)
    const url = `https://api.genius.com/search?q=${q}`
    const res = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}`
        }
    })

    // Pick the first hit (best match)
    const hits = res.data.response.hits
    if (!hits.length) throw new Error('No results found')
    const songUrl = hits[0].result.url
    return songUrl
}

// Second - Scrape lyrics from Genius page
export async function scrapeGeniusLyrics(songUrl) {
    const { data } = await axios.get(songUrl)
    const $ = load(data)
    
    // As of Jul 2025, these selectors work but Genuis can change them
    const lyrics = $('[data-lyrics-container="true"]').text().trim()
    return lyrics || null
}

// Third - Full pipeline: search and scrape
export async function getLyricsFromGenius(artist, title) {
    const songUrl = await searchGenius(artist, title)
    const lyrics = await scrapeGeniusLyrics(songUrl)
    return lyrics
}
