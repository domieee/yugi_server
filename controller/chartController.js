export const getTournamentBreakdown = async (req, res, next) => {
    const tournamentId = req.body.id

    const pipeline = [
        {
            $match: {
                _id: ObjectId(tournamentId)
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
    ];

    const cursor = tournaments.aggregate(pipeline)
    let percentageValue = 0

    await cursor.forEach(result => {
        values.push(result._id)
        counts.push(result.count)
    });

    counts.forEach(count => {
        percentageValue += count
    });

    counts.forEach(count => {
        let percentage = (count * 100) / percentageValue;
        percentage = percentage.toFixed(2)
        percentages.push(percentage)
    });

    data.push(values)
    data.push(counts)
    data.push(percentages)

    res.status(200).json(data)
}