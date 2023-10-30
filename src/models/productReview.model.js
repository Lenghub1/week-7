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
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    userId: {
      type: mongoose.Schema.ObjectId,
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
