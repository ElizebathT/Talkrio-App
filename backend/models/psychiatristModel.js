const mongoose = require("mongoose");

const PsychiatristSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: { 
        type: String, 
        required: true 
    },
    specialization: { 
        type: String, 
        required: true 
    },
    availability: [
        {
            day: String, // e.g., "Monday"
            start: String, // e.g., "09:00"
            end: String // e.g., "17:00"
        }
    ],
    contact: { 
        type: String, 
        required: true 
    },
});

const Psychiatrist= mongoose.model("Psychiatrist", PsychiatristSchema);
module.exports = Psychiatrist;