const express=require("express");
const userRoutes = require("./userRouter");
const postRoutes = require("./postRouter");
const commentRoutes = require("./commentRouter");
const reportRoutes = require("./reportRouter");
const chatRouter = require("./chatRouter");
const psychiatristRoutes = require("./psychiatristRouter");
const router=express()

router.use("/users", userRoutes);
router.use("/post", postRoutes);
router.use("/comment", commentRoutes);
router.use("/report", reportRoutes);
router.use("/bot", chatRouter);
router.use("/psychiatrist", psychiatristRoutes);

module.exports=router