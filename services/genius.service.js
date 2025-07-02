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
    const songUrl = await searchGenius(artist, title)
    let lyrics = await scrapeGeniusLyrics(songUrl)
    // const cleanLyrics = await askGemini(lyrics)
    // console.log(lyrics)
    // lyrics = cleanLyrics(lyrics)
    return lyrics
}

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({})

async function askGemini(rawLyrics) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `I'm doing a spotify clone.
        I need the lryics cleaned for proj demo
        Make it the best you can  like original SPotify
        The lyrics are (from genius api, raw state) : ${rawLyrics}`,
    })
    console.log(response.text);
    return response.text
}

