import commentService from "@/services/comment.service.js";
import factory from "./factory.js";

const commentController = {
  getAllComments: factory.getAll(commentService.getAll),
  getComment: factory.getById(commentService.get),
  createComment: factory.create(commentService.create),
  updateComment: factory.updateById(commentService.update),
  deleteComment: factory.deleteById(commentService.delete),
};

export default commentController;
