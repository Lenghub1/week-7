import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    upVote: Number,
    downVote: Number,
    createAt: {
      type: Date,
      default: Date.now,
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      requred: true,
    },
    Product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
