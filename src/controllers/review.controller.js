import reviewService from "../services/review.service.js";
import catchAsync from "../utils/catchAsync.js";

const reviewController = {
  createReview: catchAsync(async (req, res) => {
    const { productId } = req.params;
    const reviewInput = req.body;
    const newReview = await reviewService.createReview(productId, reviewInput);
    res.status(200).json(newReview);
  }),
};

export default reviewController;
