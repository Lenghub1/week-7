import reviewService from "../services/review.service.js";
import catchAsync from "../utils/catchAsync.js";

const reviewController = {
  createReview: catchAsync(async (req, res) => {
    const { productId } = req.params;
    const reviewInput = req.body;
    const newReview = await reviewService.createReview(productId, reviewInput);
    res.status(200).json(newReview);
  }),
  deleteReview: catchAsync(async (req, res) => {
    const { productId } = req.params;
    const { reviewId } = req.body;
    const deletedReview = await reviewService.deleteReview(productId, reviewId);
    res.status(200).json(deletedReview);
  }),
  updateReview: catchAsync(async (req, res) => {
    const { productId } = req.params;
    const { reviewId, rating, review } = req.body;
    const updateData = { rating, review };
    const updatedReview = await reviewService.updateReview(
      productId,
      reviewId,
      updateData
    );
    res.status(200).json(updatedReview);
  }),
  getReviews: catchAsync(async (req, res) => {
    const { productId } = req.params;
    const { page } = req.query;
    console.log(page);
    const moreReviews = await reviewService.getReviews(productId, page);
    res.status(200).json(moreReviews);
  }),
};

export default reviewController;
