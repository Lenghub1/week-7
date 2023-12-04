import catchAsync from "../utils/catchAsync.js";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import APIError from "../utils/APIError.js";

const isAuthorizeReview = catchAsync(async (req, res, next) => {
  const { role: userRole, id: userId } = req.user;
  // const userRole = "admin";
  // const userId = "656870f96833280aceb69dbf";
  const { productId, reviewId } = req.params;

  // Check if product exists
  const product = await Product.findOne({ _id: productId, status: "Public" });
  if (!product) {
    throw new APIError({
      status: 400,
      message: "No product found with this id.",
    });
  }

  // Check if review exists
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new APIError({
      status: 404,
      message: "No review found with this id.",
    });
  }

  if (userRole !== "admin" && userId !== review.userId.toString()) {
    throw new APIError({ status: 401, message: "Unauthorized." });
  }

  return next();
});

export default isAuthorizeReview;
