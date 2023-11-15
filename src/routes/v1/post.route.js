import postController from "../../controllers/post.controller.js";
import express from "express";
import { runValidation } from "../../validators/index.js";
import createPostValidator from "../../validators/post.validator.js";
import commentRoute from "./comment.route.js";

const route = express.Router();

route
  .route("/")
  .get(postController.getAllPosts)
  .post(createPostValidator, runValidation, postController.createPost);

route
  .route("/:id")
  .get(postController.getPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

route.use("/:postID/comments", commentRoute);

export default route;
