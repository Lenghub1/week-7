import commentService from "./../services/comment.service.js";
import factory from "./factory.js";

const commentController = {
  getAllComments: factory.getAll(commentService.getAllComments),
  getComment: factory.getById(commentService.getComment),
  createComment: factory.create(commentService.createComment),
  updateComment: factory.updateById(commentService.updateComment),
  deleteComment: factory.deleteById(commentService.deleteComment),
};

export default commentController;
