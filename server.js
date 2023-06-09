import express from 'express'
import cors from 'cors'
import './util/dotenv.js'
import { ObjectId } from 'mongodb'

import { connectDatabase } from './util/db.js'

import { getTournamentBreakdown } from './controller/chartController.js'

import {
    validateRegisterInput
} from './middlewares/joiAuthMiddleware.js'

const app = express()

const PORT = process.env.PORT || process.env.FALLBACK_PORT



app.use(cookieParser())
app.use(express.json())

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true
};

app.use(cors(corsOptions))


app.get('/', async (req, res) => {
    const db = await connectDatabase()
    const json = await db.collection('tournaments').find({}).toArray()
    console.log(json)
    res.json(json)
})

app.post('/register', validateRegisterInput)

app.post('/tournament-overview', async (req, res) => {
    console.log(req.body.id)
    try {
        const reqID = new ObjectId(req.body.id[0]);
        console.log(reqID)
        const db = await connectDatabase();
        const json = await db.collection('tournaments').findOne({ _id: reqID });
        console.log(json)
        res.json(json);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get('/winner-breakdown', async (req, res) => {

    const data = []
    const values = []
    const counts = []
    const percentages = []

    try {
        const db = await connectDatabase()
        const tournaments = db.collection('tournaments')

        const pipeline = [
            {
                $unwind: "$player"
            },
            {
                $match: {
                    "player.place": "first"
                }
            },
            {
                $group: {
                    _id: "$player.deck",
                    count: { $sum: 1 }
                }
            }
        ]

        const cursor = tournaments.aggregate(pipeline)
        let percentageValue = 0

        await cursor.forEach(result => {
            values.push(result._id)
            counts.push(result.count)
        })

        counts.forEach(count => {
            percentageValue += count
        })

        counts.forEach(count => {
            let percentage = (count * 100) / percentageValue
            percentage = percentage.toFixed(2)
            percentages.push(percentage)
        })

        data.push(values)
        data.push(counts)
        data.push(percentages)

        res.status(200).json(data)
    } catch (error) {
        console.error("Error retrieving winner breakdown:", error)
        res.status(500).json({ error: "An error occurred while retrieving the winner breakdown" })
    }
})

app.get('/overall-breakdown', async (req, res) => {

    const data = []
    const values = []
    const counts = []
    const percentages = []

    try {

        const db = await connectDatabase()
        const tournaments = db.collection('tournaments')

        const pipeline = [
            {
                $unwind: "$player"
            },
            {
                $group: {
                    _id: "$player.deck",
                    count: { $sum: 1 }
                }
            }
        ]

        const cursor = tournaments.aggregate(pipeline)
        let percentageValue = 0

        await cursor.forEach(result => {
            values.push(result._id)
            counts.push(result.count)
        })

        counts.forEach(count => {
            percentageValue += count
        })

        counts.forEach(count => {
            let percentage = (count * 100) / percentageValue
            percentage = percentage.toFixed(2)
            percentages.push(percentage)
        })

        data.push(values)
        data.push(counts)
        data.push(percentages)

        res.status(200).json(data)
    } catch (error) {
        console.error("Error retrieving deck count:", error)
        res.status(500).json({ error: "An error occurred while retrieving the deck count" })
    }
})

app.post('/tournament-breakdown', getTournamentBreakdown)

try {
    app.listen(PORT, () => console.log(`Server listening on ${PORT} 👍`))
} catch (err) {
    console.log(`Server not able to run on ${PORT} 👎, Error: ${err}`)
}
