import mongoose from "mongoose";
import Review from "../models/review.model.js";
import APIError from "../utils/APIError.js";
import Product from "../models/product.model.js";

const reviewService = {
  async createReview(productId, reviewInput) {
    // Start a session
    const session = await mongoose.startSession();
    const reviewData = { product: productId, ...reviewInput };

    try {
      // Start the transaction
      session.startTransaction();

      const review = new Review(reviewData);
      await review.save({ session });

      const product = await Product.findById(review.product).session(session);

      // Update Product's review count and average rating
      product.reviewCount += 1;
      product.averageRating =
        (product.reviewCount * product.averageRating + review.rating) /
        product.reviewCount;

      // Add the new review to the start of the reviews array
      product.reviews.unshift({
        _id: review._id,
        review: review.review,
        rating: review.rating,
        upVote: review.upVote || 0,
        downVote: review.downVote || 0,
        userId: review.userId,
      });
      // Limit the reviews array to 10
      product.reviews = product.reviews.slice(0, 10);

      await product.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      return review;
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw new APIError({
        status: 400,
        message: "Cannot create a comment!",
        error: error,
      });
    }
  },
};

export default reviewService;


