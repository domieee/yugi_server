import { MongoClient } from 'mongodb'

const URI = process.env.MONGO_URI
const DB = process.env.MONGO_DB

const client = new MongoClient(URI)
let db

export const connectDatabase = async () => {
    if (db) return db
    else {
        try {
            await client.connect()
            db = client.db(DB)
            console.log(`Database connected successfully`)
            return db
        } catch (error) {
            console.log(`Error connecting to database: ${error.message}`)
        }
    }
}