import factory from "./factory";
import postService from "../services/post.service";

const postController = {
  getAllPosts: factory.getAll(postService.getAllPosts),
  getPost: factory.getById(postService.getPost),
  createPost: factory.create(postService.createPost),
  updatePost: factory.updateById(postService.updatePost),
  deletePost: factory.deletePost(postService.deletePost),
};

export default postController;
