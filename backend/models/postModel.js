const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    images:[{
        type: String,
    }],
    content: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    isApproved: {
        type: Boolean,
        default: false,
    },
    taggedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
