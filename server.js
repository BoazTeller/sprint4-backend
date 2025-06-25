// Node.js core modules
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

// External modules
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

// Services
import { logger } from './services/logger.service.js'
import { setupSocketAPI } from './services/socket.service.js'

// Routes
import { authRoutes } from './api/auth/auth.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'
import { stationRoutes } from './api/station/station.routes.js'
import { userRoutes } from './api/user/user.routes.js'

// Middleware imports
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

// Suport for __dirname in ES modules
const __filename = fileURLToPath (import.meta.url)
const __dirname = dirname(__filename)

// App setup
const app = express()
const server = createServer(app)
const isProduction = process.env.NODE_ENV === 'production'

// Middleware registration
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')
app.all('/*all', setupAsyncLocalStorage) // Init ALS context for all routes

if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://127.0.0.1:3030',
            'http://localhost:3030',
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'http://127.0.0.1:5174',
            'http://localhost:5174',
        ],
        credentials: true,
    }
    app.use(cors(corsOptions))
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/station', stationRoutes)
app.use('/api/user', userRoutes)

// Set up sockets after routes are loaded
setupSocketAPI(server)

// Fallback route: serve index.html
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

// Start server
const port = process.env.PORT || 3030
server.listen(port, (err) => {
    if (err) loggerService.error('Server failed to start', err)
    else logger.info(`Server is running on http://localhost:${port}`)
})


