import Tournament from "../models/tournamentModel.mjs";


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

function separatePlayersByPlace(players) {
    const separatedPlayers = [
        [],
        [],
        [],
        [],
        []
    ];

    players.forEach((player) => {
        switch (player.place) {
            case 'first':
                separatedPlayers[0].push(player);
                break;
            case 'second':
                separatedPlayers[1].push(player);
                break;
            case 'top4':
                separatedPlayers[2].push(player);
                break;
            case 'top8':
                separatedPlayers[3].push(player);
                break;
            case 'top16':
                separatedPlayers[4].push(player);
                break;
            default:
                break;
        }
    });

    return separatedPlayers;
}

export async function fetchTournamentTreeData(req, res, next) {
    try {

        const tournament = await Tournament.findById(req.body.tournamentId).lean();

        if (!tournament) {
            console.log('No tournament data found.');
            return;
        }

        const playersByPlace = separatePlayersByPlace(tournament.player);
        console.log(playersByPlace);
        res.json(playersByPlace)

    } catch (error) {
        console.error('Error fetching players:', error);
        res.end()
    }
}