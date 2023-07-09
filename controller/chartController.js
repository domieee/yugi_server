import { connectDatabase } from "../util/db.js"

import { ObjectId } from 'mongodb'

export const getTournamentBreakdown = async (req, res, next) => {
    const tournamentId = new ObjectId(req.body.id[0])

    const data = [];
    const values = [];
    const counts = [];
    const percentages = [];

    try {
        const db = await connectDatabase();
        const tournaments = db.collection('tournaments');

        const pipeline = [
            {
                $match: {
                    _id: tournamentId
                }
            },
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
            }
        ];

        const cursor = tournaments.aggregate(pipeline);
        console.log("🚀 ~ file: chartController.js:38 ~ getTournamentBreakdown ~ cursor:", cursor)
        let percentageValue = 0;

        await cursor.forEach(result => {
            values.push(result._id);
            counts.push(result.count);
        });

        counts.forEach(count => {
            percentageValue += count;
        });

        counts.forEach(count => {
            let percentage = (count * 100) / percentageValue;
            percentage = percentage.toFixed(2);
            percentages.push(percentage);
        });

        let indexArray = Array.from(Array(values.length).keys());

        // Sortiere das Index-Array basierend auf den Prozentwerten
        indexArray.sort((a, b) => percentages[b] - percentages[a]);

        let sortedValues = indexArray.map(i => values[i]);
        let sortedCounts = indexArray.map(i => counts[i]);
        let sortedPercentages = indexArray.map(i => percentages[i]);

        data.push(sortedValues);
        data.push(sortedCounts);
        data.push(sortedPercentages);

        res.status(200).json(data);
    } catch (error) {
        console.log(error);
    }
};