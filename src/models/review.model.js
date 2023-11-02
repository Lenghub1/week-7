import mongoose from "mongoose";
import Product from "./product.model";
import APIError from "../utils/APIError";

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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
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

reviewSchema.post("save", async function () {
  if (this.createdAt === this.updatedAt) {
    try {
      const product = await Product.findById(this.productId);

      // update Product's review count and average rating
      const newReviewCount = product.reviewCount + 1;

      const newAverageRating =
        (product.reviewCount * product.averageRating + this.rating) /
        newReviewCount;

      product.reviewCount = newReviewCount;
      product.averageRating = newAverageRating;

      const reviewFields = {
        _id: this._id,
        review: this.review,
        rating: this.rating,
        upVote: this.upVote,
        downVote: this.downVote,
        userId: this.userId,
      };
      // add the new review to the start of the reviews array
      product.reviews.unshift(reviewFields);
      // limit the reviews array to 10
      product.reviews = product.reviews.slice(0, 10);
      await product.save();
    } catch (errors) {
      throw new APIError({
        status: 404,
        message: "There is no product found with this ID.",
        errors,
      });
    }
  }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
