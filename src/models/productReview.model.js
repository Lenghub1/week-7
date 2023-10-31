import mongoose from "mongoose";

const productReviewSchema = new mongoose.Schema(
  {
    review: String,
    rate: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    upVotes: {
      type: number,
      default: 0,
    },
    downVotes: {
      type: number,
      default: 0,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const ProductReview = mongoose.model("ProductReview", productReviewSchema);
export default ProductReview;
