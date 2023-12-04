import express from "express";
import reviewController from "../../controllers/review.controller.js";
import isAuth from "../../middlewares/isAuth.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.getReviews)
  // TODO @later: verify if user purchased the product to be able create to a Review.
  .post(isAuth, reviewController.createReview);

router
  .route("/:reviewId")
  .delete(isAuth, reviewController.deleteReview)
  .patch(isAuth, reviewController.updateReview);

export default router;
