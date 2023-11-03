import Comment from "../models/comment.model.js";
import APIError from "../utils/APIError.js";

const commentService = {
  async getAllComments() {
    const comments = await Comment.find({});
    if (!comments) {
      throw new APIError({
        status: 404,
        message: "There is no comment found",
        errors,
      });
    }
    return comments;
  },
  async getComment(postId) {
    const comment = await Comment.findById(postId);
    if (!comment) {
      throw new APIError({
        status: 404,
        message: "There is no comments found with this ID",
        errors,
      });
    }
    return comment;
  },
  async createComment(input) {
    const newComment = await Comment.create(input);
    if (!newComment) {
      throw new APIError({
        status: 400,
        message: "Cannot Create New Comment",
        errors,
      });
    }
    return newComment;
  },
  async updateComment(postId, postBody) {
    const comment = await Comment.findByIdAndUpdate(postId, postBody, {
      new: true,
      runValidators: true,
    });
    if (!comment) {
      throw new APIError({
        status: 404,
        message: "There is no comment found with this ID",
        errors,
      });
    }
    return comment;
  },
  async deleteComment(postId) {
    const comment = await Comment.findByIdAndDelete(postId);
    if (!comment) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID",
        errors,
      });
    }
  },
};

export default commentService;
