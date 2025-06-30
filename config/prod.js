export default {
  dbURL: process.env.MONGO_URL || 'mongodb+srv://zangetsu923:12345@cluster0.oxdptc6.mongodb.net/',
  dbName: process.env.DB_NAME || 'spotify_db',
}

// import dotenv from 'dotenv'
// dotenv.config()

// export default {
//     dbURL: process.env.MONGO_URL || 'mongodb+srv://stavyaarbar:anistav12345@cluster0.uqvtq.mongodb.net/',
//     dbName: process.env.DB_NAME || 'spotify_db'
// }
