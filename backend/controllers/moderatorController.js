const asyncHandler = require('express-async-handler');
const Report = require('../models/reportModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const User = require('../models/userModel');

const moderatorController={
    reviewReports : asyncHandler(async (req, res) => {
        const reports = await Report.find()
            .populate('reportedBy', 'username email')
            .populate('targetId')
            .sort({ status: 1, createdAt: -1 });         
        if (!reports || reports.length === 0) {
            return res.send("No reports found");
        }
        res.send(reports);
    }),

    takeActionOnReport : asyncHandler(async (req, res) => {
        const { id, action } = req.body;         
        const report = await Report.findById(id);
        let userId
        if (!report) {
            throw new Error('Report not found');
        }    
        report.status = action 
        report.actionTakenBy = req.user.id;
        report.actionTakenAt = new Date();
        await report.save();
        if (action === 'Approved') {
            if (report.type === 'Post') {
                const post = await Post.findByIdAndDelete(report.targetId);
                if (post) userId = post.userId; // Assuming Post schema has userId
            } else if (report.type === 'Comment') {
                const comment = await Comment.findByIdAndDelete(report.targetId);
                if (comment) userId = comment.userId; // Assuming Comment schema has userId
            }

            await Report.findByIdAndDelete(id); // Remove the report after action is taken

            // If userId exists, increment their report count
            if (userId) {
                const user = await User.findById(userId);

                if (user) {
                    user.reports += 1; // Increment report count
                    if (user.reports >= 10) {
                        user.blocked = true; // Block user if they exceed the report limit
                    }
                    await user.save(); // Save updated user data
                }
            }
        }

        res.send({ message: `Report ${action} successfully` });
    })
}
module.exports=moderatorController