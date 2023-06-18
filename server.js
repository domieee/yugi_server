import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import './util/dotenv.js'
import cookieParser from 'cookie-parser'
import { ObjectId } from 'mongodb'

import { connectDatabase } from './util/db.js'

import { getTournamentBreakdown } from './controller/chartController.js'

import {
    encrypt
} from './middlewares/claimAuthMiddleware.js'

import {
    validateRegisterInput,
    validateLoginInput
} from './middlewares/joiAuthMiddleware.js'

import {
    completeRegistration,
    completeLogin
} from './controller/registrationController.js'

import {
    receiveUserInformations,
    validateModeratorAction
} from './controller/tokenController.js'

import {
    postNewTournament,
    fetchTournamentTreeData
} from './controller/tournamentController.js'

const app = express()



app.use(express.json())
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(cors({ origin: '*' }))
app.use(cookieParser())
const PORT = process.env.PORT || process.env.FALLBACK_PORT



app.get('/', async (req, res) => {
    const db = await connectDatabase()
    const json = await db.collection('tournaments').find({}).toArray()
    console.log(json)
    res.json(json)
})

app.post(
    '/register',
    validateRegisterInput,
    encrypt,
    completeRegistration,
    receiveUserInformations
)

app.post(
    '/login',
    validateLoginInput,
    encrypt,
    completeLogin
)

app.post('/receive-user-informations', receiveUserInformations)

// TODO: Create a middleware that validates the user status (administrator, moderator)
app.post('/post-new-tournament', validateModeratorAction, postNewTournament)

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

app.post('/fetch-tournament-tree', fetchTournamentTreeData)

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

try {
    mongoose.connect(`${process.env.MONGO_URI}data`)
    console.log(`Database connected successfully 👍`)
} catch (err) {
    console.log(`Not able to connect Database 👎, Error: ${err}`)
}
