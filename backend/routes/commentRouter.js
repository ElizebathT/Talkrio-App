const express = require("express");
const userAuthentication = require("../middlewares/userAuthentication");
const commentController = require("../controllers/commentController");
const commentRoutes = express.Router();

commentRoutes.post("/add", userAuthentication,commentController.createComment);
commentRoutes.put("/edit", userAuthentication,commentController.updateComment);
commentRoutes.get("/search", userAuthentication,commentController.getCommentsByPost);
commentRoutes.delete("/delete", userAuthentication,commentController.deleteComment);

module.exports = commentRoutes;