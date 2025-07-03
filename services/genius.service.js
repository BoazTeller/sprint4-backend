import axios from 'axios'
import { load } from 'cheerio'
import { GoogleGenAI } from "@google/genai";
import FirecrawlApp  from '@mendable/firecrawl-js';
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

    // curl "https://r.jina.ai/"

    console.log('URL', url)
    console.log( 'RESSS', res.data)

    // Pick the first hit (best match)
    const hits = res.data.response.hits
    if (!hits.length) throw new Error('No results found')
    const songUrl = hits[0].result.url
console.log('songurl ', songUrl);

    return songUrl
}

// Install with npm install @mendable/firecrawl-js

const app = new FirecrawlApp({apiKey: process.env.FIRE_CRWL});

async function scrapeFireCrwal(url) {
    try{
const {markdown} = await app.scrapeUrl(url, {
	formats: [ "markdown" ],
	onlyMainContent: true
});
// console.log(markdown)

return markdown
    }catch(err){
        console.log(err);
        
    }

}



// Second - Scrape lyrics from Genius page
// export async function scrapeGeniusLyrics(songUrl) {
//     // const { data } = await axios.get(songUrl)
    
//     // const { data } = await axios.get(songUrl, {
//     //     headers: {
//     //         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
//     //     }
//     // })

//     const { data } = await axios.get(songUrl, {
//         headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
//             'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//             'Accept-Language': 'en-US,en;q=0.5',
//         },
//         timeout: 30000
//     })


//     const $ = load(data)
    
//     // As of Jul 2025, these selectors work but Genuis can change them
//     const lyrics = $('[data-lyrics-container="true"]').text().trim()
//     return lyrics || null
// }

    // export async function scrapeGeniusLyrics(songUrl) {
    //     try {
    //         const { data } = await axios.get(songUrl, {
    //             headers: {
    //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    //                 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    //                 'Accept-Language': 'en-US,en;q=0.5',
    //             },
    //             timeout: 7000
    //         })

    //         const $ = load(data)
    //         const lyrics = $('[data-lyrics-container="true"]').text().trim()
    //         return lyrics || null
    //     } catch (err) {
    //         console.error('🔥 Genius scrape error:', err.message)
    //         return null
    //     }
    // }


const SCRAPERAPI_KEY = process.env.SCRAPERAPI_KEY

export async function scrapeGeniusLyrics(songUrl) {
    try {
        // Route the request through ScraperAPI!
        const apiUrl = `http://api.scraperapi.com/?api_key=${SCRAPERAPI_KEY}&url=${encodeURIComponent(songUrl)}`
        const { data } = await axios.get(apiUrl, {
            timeout: 15000  // longer timeout, since it's an external service
        })

        const $ = load(data)
        const lyrics = $('[data-lyrics-container="true"]').text().trim()
        return lyrics || null
    } catch (err) {
        console.error('🔥 Genius scrape error:', err.message)
        return null
    }
}

// Third - Full pipeline: search and scrape
export async function getLyricsFromGenius(artist, title) {
    // return lyricsTxt
    console.log('getting lyrics for:', artist, title)
    const songUrl = await searchGenius(artist, title)
    const lyrics = await scrapeGeniusLyrics(songUrl)
    if (!lyrics) throw new Error('No lyrics found on Genius')
    console.log(lyrics)
    return
    // let lyrics = await scrapeFireCrwal(songUrl)
    // const cleanLyrics = await askGemini(lyrics)
    // // console.log(lyrics)
    // // lyrics = cleanLyrics(lyrics)
    // return cleanLyrics
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


const lyricsTxt = 
`[Intro: Chester Bennington]
It starts with one

[Verse 1: Mike Shinoda, Mike Shinoda & Chester Bennington]
One thing, I don't know why
It doesn't even matter how hard you try
Keep that in mind, I designed this rhyme
To explain in due time, all I know
Time is a valuable thing
Watch it fly by as the pendulum swings
Watch it count down to the end of the day
The clock ticks life away, it's so unreal
Didn't look out below
Watch the time go right out the window
Tryin' to hold on, d-didn't even know
I wasted it all just to watch you go

[Pre-Chorus: Mike Shinoda]
I kept everything inside
And even though I tried, it all fell apart
What it meant to me will eventually be
A memory of a time when I tried so hard

[Chorus: Chester Bennington]
I tried so hard and got so far
But in the end, it doesn't even matter
I had to fall to lose it all
But in the end, it doesn't even matter

[Verse 2: Mike Shinoda, Mike Shinoda & Chester Bennington]
One thing, I don't know why
It doesn't even matter how hard you try
Keep that in mind, I designed this rhyme
To remind myself how I tried so hard
In spite of the way you were mockin' me
Actin' like I was part of your property
Remembering all the times you fought with me
I'm surprised it got so far
Things aren't the way they were before
You wouldn't even recognize me anymore
Not that you knew me back then
But it all comes back to me in the end

[Pre-Chorus: Mike Shinoda]
You kept everything inside
And even though I tried, it all fell apart
What it meant to me will eventually be
A memory of a time when I tried so hard

[Chorus: Chester Bennington]
I tried so hard and got so far
But in the end, it doesn't even matter
I had to fall to lose it all
But in the end, it doesn't even matter

[Bridge: Chester Bennington]
I've put my trust in you
Pushed as far as I can go
For all this, there's only one thing you should know
I've put my trust in you
Pushed as far as I can go
For all this, there's only one thing you should know

[Chorus: Chester Bennington]
I tried so hard and got so far
But in the end, it doesn't even matter
I had to fall to lose it all
But in the end, it doesn't even matter`