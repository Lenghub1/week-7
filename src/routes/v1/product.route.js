import express from "express";
import usersProductController from "../../controllers/product.controller.js";
import reviewController from "../../controllers/review.controller.js";
import isAuth from "../../middlewares/isAuth.js";

const router = express.Router();

router.route("/").get(usersProductController.getByCategories);
router.route("/all").get(usersProductController.getUserProducts);
router.route("/hot").get(usersProductController.getHotProducts);
router.route("/top").get(usersProductController.getTopProducts);

router.route("/:id").get(usersProductController.getProductDetails);
router
  .route("/:productId/reviews")
  .get(reviewController.getReviews)
  // TODO @later: verify if user purchased the product to be able create to a Review.
  .post(isAuth, reviewController.createReview);

router
  .route("/:productId/reviews/:reviewId")
  .delete(isAuth, reviewController.deleteReview)
  .patch(isAuth, reviewController.updateReview);

export default router;
