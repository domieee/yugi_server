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
    validateModeratorAction,
    validateTournamentCreationPermission
} from './controller/tokenController.js'

import {
    postNewTournament,
    fetchTournamentTreeData,
    createNewTournament
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
        console.log("🚀 ~ file: server.js:85 ~ app.post ~ json:", json)
        res.json(json);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/fetch-new-tournament', validateTournamentCreationPermission, createNewTournament)

app.post('/fetch-tournament-tree', fetchTournamentTreeData)

app.get('/winner-breakdown', async (req, res) => {
    try {
        const db = await connectDatabase();
        const tournaments = db.collection('tournaments');



        const pipeline = [
            {
                $project: {
                    players: { $arrayElemAt: ['$players', 0] }
                }
            },
            {
                $unwind: "$players"
            },
            {
                $group: {
                    _id: "$players.deck",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ];

        const cursor = tournaments.aggregate(pipeline);
        const values = [];
        const counts = [];
        let totalCount = 0;

        await cursor.forEach(result => {
            console.log("🚀 ~ file: server.js:123 ~ app.get ~ result:", result)
            values.push(result._id);
            counts.push(result.count);
            totalCount += result.count;
        });

        const percentages = counts.map(count => ((count * 100) / totalCount).toFixed(2));

        const data = [values, counts, percentages];

        res.status(200).json(data);
    } catch (error) {
        console.error("Error retrieving counts for players[0].deck:", error);
        res.status(500).json({ error: "An error occurred while retrieving the counts for players[0].deck" });
    }
})

app.get('/overall-breakdown', async (req, res) => {

    try {
        const db = await connectDatabase();
        const tournaments = db.collection('tournaments');

        const pipeline = [

            {
                $unwind: "$players"
            },
            {
                $unwind: "$players"
            },
            {
                $group: {
                    _id: "$players.deck",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ];

        const cursor = tournaments.aggregate(pipeline);
        const values = [];
        const counts = [];
        const percentages = [];
        let totalCount = 0;

        await cursor.forEach(result => {
            values.push(result._id);
            counts.push(result.count);
            totalCount += result.count;
        });

        counts.forEach(count => {
            const percentage = ((count * 100) / totalCount).toFixed(2);
            percentages.push(percentage);
        });

        const data = [values, counts, percentages];

        res.status(200).json(data);
    } catch (error) {
        console.error("Error retrieving player deck counts:", error);
        res.status(500).json({ error: "An error occurred while retrieving the player deck counts" });
    }
})


app.get('/find-lowest-results', async (req, res) => {
    try {
        const db = await connectDatabase();
        const tournaments = db.collection('tournaments');

        const pipeline = [
            {
                $unwind: "$players"
            },
            {
                $unwind: "$players"
            },
            {
                $group: {
                    _id: "$players.deck",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ];

        const cursor = tournaments.aggregate(pipeline);
        const values = [];
        const counts = [];
        const percentages = [];
        let totalCount = 0;

        await cursor.forEach(result => {
            values.push(result._id);
            counts.push(result.count);
            totalCount += result.count;
        });

        counts.forEach(count => {
            const percentage = ((count * 100) / totalCount).toFixed(2);
            percentages.push(percentage);
        });
        function findIndicesOfLowestResult(arr) {
            const parsedPercentages = arr.map(Number); // Convert string percentages to numbers
            const lowestResult = Math.min(...parsedPercentages);
            const indices = parsedPercentages.reduce((acc, currentResult, currentIndex) => {
                if (currentResult === lowestResult) {
                    acc.push(currentIndex);
                }
                return acc;
            }, []);
            return indices;
        }
        const indicesOfLowestResult = await findIndicesOfLowestResult(percentages)

        const lowestResultArray = []

        indicesOfLowestResult.map(index => {
            if (values[index].length > 0) {
                lowestResultArray.push(values[index + 1])
            }
        })

        console.log(values, counts, percentages)

        const data = {
            value: values[indicesOfLowestResult[0]],
            count: counts[indicesOfLowestResult[0]],
            percentage: percentages[indicesOfLowestResult[0]],
            indicesOfLowestResult: lowestResultArray
        };

        res.status(200).json(data);

    } catch (error) {
        console.error("Error retrieving the deck statistics:", error);
        res.status(500).json({ error: "An error occurred while retrieving the deck statistics" });
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
