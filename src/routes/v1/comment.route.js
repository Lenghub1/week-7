import express from "express";
import commentController from "@/controllers/comment.controller.js";

const route = express.Router({ mergeParams: true });

route
  .route("/")
  .get(commentController.getAllComments)
  .post(commentController.createComment);

route
  .route("/:id")
  .get(commentController.getComment)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

export default route;
