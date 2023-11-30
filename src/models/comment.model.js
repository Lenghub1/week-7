import mongoose from "mongoose";
import Post from "./post.model.js";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      require: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    content: {
      type: {},
      trim: true,
      require: true,
    },
    isUpdated: {
      type: Boolean,
      default: false,
    },
    upvote: {
      type: Number,
      default: 0,
    },
    downvote: {
      type: Number,
      default: 0,
    },
    excerpt: {
      type: String,
      max: 300,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Comment = mongoose.model("Comment", commentSchema);
const commentStream = Comment.watch();

commentStream.on("change", async (change) => {
  if (change.operationType === "insert") {
    const post = await Post.findById(change.fullDocument.postId);

    post.commentCount++;

    await post.save();
  } else if (change.operationType === "remove") {
    const post = await Post.findById(change.fullDocument.postId);
    post.commentCount--;

    await post.save();
  }
});
export default Comment;
