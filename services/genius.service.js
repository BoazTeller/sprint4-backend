import axios from 'axios'
import { load } from 'cheerio'
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv' //import the dotenv 
dotenv.config() 

const GEMINI_API_KEY=process.env.GEMINI_API_KEY
const GENIUS_ACCESS_TOKEN=process.env.GENIUS_ACCESS_TOKEN

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
    console.log('getting lyrics for:', artist, title)
    const songUrl = await searchGenius(artist, title)
    let lyrics = await scrapeGeniusLyrics(songUrl)
    const cleanLyrics = await askGemini(lyrics)
    // console.log(lyrics)
    // lyrics = cleanLyrics(lyrics)
    return cleanLyrics
}

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const lyricsPrompt = `
You are an expert at formatting song lyrics for display in a music player, like Spotify.

You will receive raw lyrics copied from the web. These often include unwanted text at the top and bottom (contributor info, translation links, [Verse]/[Chorus] labels, or extra explanations).

Your task:
- Only keep the actual sung lyrics, **removing everything else**: contributor info, descriptions, editorial headers (like [Verse], [Chorus], [Bridge]), artist names, and anything not part of the lyrics.
- Do **not** invent or add any lyrics.
- **Each sung phrase or line should be on its own line.**
- **Keep paragraph breaks only between logical sections of the song** (like between verses, choruses, or bridges). A paragraph break means an extra blank line.
- **Do not label sections** (do not write "Verse 1", "Chorus", etc.).
- **Do not add extra blank lines**: only use one blank line between sections, and none inside a section.
- **If a phrase is meant to be repeated, write it as many times as it appears.**
- Keep any lines in parentheses only if they are actually sung.

Here is the raw lyrics text:
---
`

const ai = new GoogleGenAI({})

async function askGemini(rawLyrics) {
    const prompt = `${lyricsPrompt}${rawLyrics}\n---\n\Now, return the cleaned and display-ready lyrics. Only output the lyrics, formatted for a music app (like Spotify), with the correct line and paragraph breaks.`
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    })
    console.log(response.text)
    return response.text
}
