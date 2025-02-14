const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const asyncHandler = require('express-async-handler');

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
    res.send("Post created successfully");
}),

// Get all posts
    getAllPosts :asyncHandler(async (req, res) => {
    const posts = await Post.find();
    if(!posts){
        res.send("No posts found")
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