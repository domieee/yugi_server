import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    deck: {
        type: String,
        default: ''
    },
    deckNote: {
        type: String,
        default: ''
    },
    deckLink: {
        type: String,
        default: ''
    }
});

// Define the tournament schema
const tournamentSchema = new mongoose.Schema({
    createdBy: {
        name: {
            type: String,
            default: ''
        },
        id: {
            type: String,
            default: ''
        },
        createdAt: {
            type: Date,
            default: null
        }
    },
    editedBy: {
        type: Object,
        default: {}
    },
    tournamentType: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    totalParticipants: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: null
    },
    players: {
        type: [[playerSchema]],
        default: []
    }
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

export { Tournament }; // Export the Tournament model using named exports