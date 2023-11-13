import express from "express";
import reviewController from "../../controllers/review.controller.js";

const router = express.Router();

router
  .route("/:productId")
  .post(reviewController.createReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview)
  .get(reviewController.getReviews);

export default router;
