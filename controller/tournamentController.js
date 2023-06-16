import Tournament from "../models/tournamentModel.mjs";

export const postNewTournament = async (req, res, nex) => {
    try {
        console.log(req.body)
        const tournament = new Tournament(req.body.tournament);
        const createdTournament = await tournament.save();
        console.log(createdTournament.id)
        res.status(200).json(createdTournament.id)
    } catch (error) {
        console.error('Error creating tournament:', error);
        throw error;
    }

}