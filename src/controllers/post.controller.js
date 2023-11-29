import factory from "./factory.js";
import postService from "../services/post.service.js";

const postController = {
  getAllPosts: factory.getAll(postService.getAll),
  getPost: factory.getById(postService.get),
  createPost: factory.create(postService.create),
  updatePost: factory.updateById(postService.update),
  deletePost: factory.deleteById(postService.delete),
};

export default postController;
