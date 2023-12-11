import createService from "./common.service.js";
import Comment from "@/models/comment.model.js";

const commentService = createService(Comment);

export default commentService;
