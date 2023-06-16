import Tournament from "../models/tournamentModel.mjs";

export const postNewTournament = async (req, res, nex) => {
    try {
        const tournament = new Tournament(req.body);
        const createdTournament = await tournament.save();
        console.log('Tournament created:', createdTournament);
        res.send()
    } catch (error) {
        console.error('Error creating tournament:', error);
        throw error;
    }

}