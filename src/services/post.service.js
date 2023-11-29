import createService from "./common.service.js";
import Post from "../models/post.model.js";

const postService = createService(Post);

export default postService;
