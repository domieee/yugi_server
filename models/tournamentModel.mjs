import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    place: String,
    name: String,
    deck: String,
    deckNote: String,
    deckLink: String
});

const tournamentSchema = new mongoose.Schema({
    tournamentType: String,
    location: String,
    totalParticipants: String,
    date: Date,
    player: [playerSchema]
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;