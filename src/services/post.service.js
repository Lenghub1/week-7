import Post from "../models/post.model.js";
import APIError from "../utils/APIError.js";

const postService = {
  async getAllPosts() {
    const posts = await Post.find({});
    if (!posts) {
      throw new APIError({
        status: 404,
        message: "There is no document found",
        errors,
      });
    }
    return posts;
  },
  async getPost(postId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID",
        errors,
      });
    }
    return post;
  },
  async createPost(input) {
    const newPost = await Post.create(input);
    if (!newPost) {
      throw new APIError({
        status: 400,
        message: "Cannot Create New Post",
        errors,
      });
    }
    return newPost;
  },
  async updatePost(postId) {
    const post = await Post.findByIdAndUpdate(postId);
    if (!post) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID",
        errors,
      });
    }
    return post;
  },
  async deletePost(postId) {
    const post = await Post.findByIdAndDelete(postId);
    if (!post) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID",
        errors,
      });
    }
  },
};

export default postService;
