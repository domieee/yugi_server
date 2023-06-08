import { connectDatabase } from "../util/db.js"

import { ObjectId } from 'mongodb'

export const getTournamentBreakdown = async (req, res, next) => {
    const tournamentId = new ObjectId(req.body.id[0])

    const data = []
    const values = []
    const counts = []
    const percentages = []

    try {

        const db = await connectDatabase()
        const tournaments = db.collection('tournaments')

        const pipeline = [
            {
                $match: {
                    _id: tournamentId
                }
            },
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
            let percentage = (count * 100) / percentageValue;
            percentage = percentage.toFixed(2)
            percentages.push(percentage)
        })

        data.push(values)
        data.push(counts)
        data.push(percentages)

        res.status(200).json(data)
    } catch (error) {
        console.log(error)
    }


}