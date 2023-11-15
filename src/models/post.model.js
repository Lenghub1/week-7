import mongoose from "mongoose";
import slugify from "slugify";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
      trim: true,
      min: 3,
      max: 160,
    },
    body: {
      type: {},
      require: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    isUpdated: {
      type: Boolean,
      default: false,
    },
    media: [
      {
        type: Buffer,
      },
    ],
    upvote: {
      type: Number,
      default: 0,
    },
    downvote: {
      type: Number,
      default: 0,
    },
    slug: { type: String, unique: true, index: true },
    excerpt: {
      type: String,
      max: 300,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
postSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Post = mongoose.model("Post", postSchema);

export default Post;
