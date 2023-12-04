import reviewService from "../services/review.service.js";
import catchAsync from "../utils/catchAsync.js";

const reviewController = {
  createReview: catchAsync(async (req, res) => {
    const { productId } = req.params;
    const reviewInput = req.body;
    const userId = req.user.id;
    // const userId = "656870f96833280aceb69dba";
    const newReview = await reviewService.createReview(
      productId,
      userId,
      reviewInput
    );
    res.status(201).json(newReview);
  }),
  deleteReview: catchAsync(async (req, res) => {
    const { productId, reviewId } = req.params;
    const { id: userId, role: userRole } = req.user;
    const deletedReview = await reviewService.deleteReview(
      productId,
      reviewId,
      userId,
      userRole
    );
    res.status(200).json(deletedReview);
  }),
  updateReview: catchAsync(async (req, res) => {
    const { productId, reviewId } = req.params;
    const { rating, review } = req.body;
    const updateData = { rating, review };
    const { id: userId, role: userRole } = req.user;
    const updatedReview = await reviewService.updateReview(
      productId,
      reviewId,
      userId,
      userRole,
      updateData
    );
    res.status(200).json(updatedReview);
  }),
  getReviews: catchAsync(async (req, res) => {
    const { productId } = req.params;
    const { page } = req.query;
    const moreReviews = await reviewService.getReviews(productId, page);
    res.status(200).json(moreReviews);
  }),
};

export default reviewController;
