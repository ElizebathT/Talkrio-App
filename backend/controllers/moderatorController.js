const asyncHandler = require('express-async-handler');
const Report = require('../models/reportModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel');

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
        if (!report) {
            throw new Error('Report not found');
        }    
        report.status = action 
        report.actionTakenBy = req.user.id;
        report.actionTakenAt = new Date();
        await report.save();
        if (action === 'Approved') {
            // Remove the reported content
            if (report.type === 'Post') {
                await Post.findByIdAndDelete(report.targetId);
            } else if (report.type === 'Comment') {
                await Comment.findByIdAndDelete(report.targetId);
            }
            await Report.findByIdAndDelete(id);
        }    
        // Remove the report after action is taken
        
        res.send({ message: `Report ${action} successfully` });
    })
}
module.exports=moderatorController