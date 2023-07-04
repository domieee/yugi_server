import { Tournament } from '../models/tournamentModel.mjs';

import { ObjectId } from 'mongodb'
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

export async function fetchTournamentTreeData(req, res, next) {
    try {

        const tournament = await Tournament.findById(req.body.tournamentId).lean();


        if (!tournament) {
            res.status(404).send({ msg: 'No tournament data found' })
        }

        const players = tournament.players
        console.log("🚀 ~ file: tournamentController.js:28 ~ fetchTournamentTreeData ~ players:", players)

        res.status(200).json(players)

    } catch (error) {
        console.error('', error);
        res.status(400).send({ msg: 'Error fetching Tournament Tree' })
    }
}

export const createNewTournament = async (req, res, next) => {
    try {
        const tournament = new Tournament({
            createdBy: req.createdBy,
            editedBy: {},
            tournamentType: req.body.tournamentType,
            location: req.body.location,
            totalParticipants: req.body.totalParticipants,
            date: req.body.date,
            players: req.body.players
        });
        try {
            const createdTournament = await tournament.save();

            res.json({ tournamentId: createdTournament.id })
        } catch (err) {
            console.log(err)
            res.end()
        }
    } catch (err) {
        console.log(err)
    }
}