const express = require("express");
const userAuthentication = require("../middlewares/userAuthentication");
const postController = require("../controllers/postController");
const postRoutes = express.Router();

postRoutes.post("/create", userAuthentication,postController.createPost);
postRoutes.get("/viewall", userAuthentication,postController.getAllPosts);
postRoutes.get("/search", userAuthentication,postController.getPostById);
postRoutes.delete("/delete", userAuthentication,postController.deletePost);
postRoutes.put("/edit", userAuthentication,postController.updatePost);
postRoutes.put("/like", userAuthentication,postController.likePost);
postRoutes.put("/dislike", userAuthentication,postController.unlikePost);

module.exports = postRoutes;