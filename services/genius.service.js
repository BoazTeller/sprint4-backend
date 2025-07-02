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
You are an expert at cleaning and formatting song lyrics for music apps.

Here are the lyrics as received, copied raw from the Genius API or website. They often include junk at the start (contributor counts, translations, song info), editorial headers (like [Verse 1: ...]), artist names in brackets, and other non-lyric content.

Your job is to:
- Remove everything that is not the actual lyrics, including contributor info, translation tags, descriptions, and all section headers like [Verse], [Chorus], [Bridge], and [Outro].
- Remove all editorial or informational sentences such as “Read More”, “Lyrics by”, “Translations”, or anything similar.
- Remove all artist and contributor names from the lyrics.
- Keep the actual lyrics lines, preserving reasonable line breaks between phrases and verses.
- Preserve parenthetical lines only if they are sung as part of the lyrics (for example: (When this began) or (I was confused)).
- Format the lyrics as a single clean block, similar to how lyrics appear in Spotify: no section labels, no excessive blank lines, just neat, readable lyrics.
- Do not add or invent any lyrics; only use what is in the provided text.

Here are the raw lyrics:
---
`

const ai = new GoogleGenAI({})

async function askGemini(rawLyrics) {
    const prompt = `${lyricsPrompt}${rawLyrics}\n---\n\nNow return only the cleaned, display-ready lyrics, in plain text, with no other explanation or extra formatting.`
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    })
    console.log(response.text)
    return response.text
}
