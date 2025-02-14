const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    symptomsDiscussed: { 
        type: [String], 
        required: true 
    }, // List of symptoms related to this community
    members: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    ], // Users who joined the community
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Community = mongoose.model("Community", communitySchema);
module.exports = Community;
