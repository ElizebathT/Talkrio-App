const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const postController={
// Create a new post
    createPost : asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id; // Assuming user ID is available in request

    const post = new Post({
        userId,
        content,
    });
    
    await post.save();
    await User.findByIdAndUpdate(userId, {
        $push: {
            recentActivity: {
                postId:post._id,
                action: "post",
                timestamp: new Date()
            }
        }
    });
    res.send("Post created successfully");
}),

suggestPosts :asyncHandler( async (req,res) => {
    const user = await User.findById(req.user.id).populate("recentActivity.postId");
    if (!user || !user.recentActivity || user.recentActivity.length === 0) {
        return res.send("No suggestions"); // No activity, return no suggestions
    }
    const keywords = user.recentActivity.map(activity => activity.postId.keywords).flat();
    const suggestedPosts = await Post.find({
        keywords: { $in: keywords },
        _id: { $nin: user.recentActivity.map(activity => activity.postId._id) }
    }).limit(10).sort({ createdAt: -1 });
    const postsWithCounts = suggestedPosts.map(post => ({
        _id: post._id,
        userId: post.userId,
        content: post.content,
        createdAt: post.createdAt,
        likesCount: post.likes ? post.likes.length : 0,  // Handle undefined likes
        commentsCount: post.comments ? post.comments.length : 0,  // Handle undefined comments
    }));    
    res.send(postsWithCounts);
}),

// Get all posts
getAllPosts: asyncHandler(async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 }); // Sort by createdAt in descending order
    if (!posts || posts.length === 0) {
        return res.send("No posts found");
    }
    const postsWithCounts = posts.map(post => ({
        _id: post._id,
        userId: post.userId,
        content: post.content,
        createdAt: post.createdAt,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
    }));
    res.send(postsWithCounts);
}),

updatePost :asyncHandler(async (req, res) => {
    const { content } = req.body;
    const {id}=req.body
    const post = await Post.findById(id);
    
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    
    if (post.userId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to update this post');
    }
    
    post.content = content || post.content;
    await post.save();
    res.json("Post updated succcessfully");
}),

// Get a single post by ID
    getPostById :asyncHandler(async (req, res) => {
    const {id}=req.body
    const post = await Post.findById(id).populate('comments');
    
    if (!post) {
        throw new Error('Post not found');
    }
    
    res.send(post);
}),

// Delete a post
    deletePost : asyncHandler(async (req, res) => {
    const {id}=req.body
    const post = await Post.findById(id);
    
    if (!post) {
        throw new Error('Post not found');
    }
    await Comment.deleteMany({ postId: id });
    await post.deleteOne();
    res.send('Post removed');
}),

    likePost : asyncHandler(async (req, res) => {
    const { id } = req.body;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    
    if (!post) {
        throw new Error('Post not found');
    }    
    if (!post.likes.includes(userId)) {
        post.likes.push(userId);
        await post.save();
    }
    await User.findByIdAndUpdate(userId, {
        $push: {
            recentActivity: {
                postId:post._id,
                action: "like",
                timestamp: new Date()
            }
        }
    });
    res.send( 'Post liked');
}),

    unlikePost : asyncHandler(async (req, res) => {
    const { id } = req.body;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    if (!post) {
        throw new Error('Post not found');
    }
    
    post.likes = post.likes.filter(like => like.toString() !== userId);
    await post.save();
    
    res.send('Post unliked');
}),

}
module.exports=postController