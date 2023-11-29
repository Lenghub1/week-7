import factory from "./factory.js";
import postService from "../services/post.service.js";

const postController = {
  getAllPosts: factory.getAll(postService.getAllPosts),
  getPost: factory.getById(postService.getPost),
  createPost: factory.create(postService.createPost),
  updatePost: factory.updateById(postService.updatePost),
  deletePost: factory.deleteById(postService.deletePost),
};

export default postController;
