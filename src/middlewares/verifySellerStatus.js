import APIError from "../utils/APIError.js";
// Verify Seller status
// 1.
const verifySellerStatus = () => {
  return (req, res, next) => {
    if (req.user.sellerStatus === "pending") {
      return next(
        new APIError({
          status: 403,
          message:
            "Forbidden: Seller status is pending. You do not have permission as a seller yet.",
        })
      );
    } else if (!req.user.sellerStatus || req.user.sellerStatus !== "active") {
      return next(
        new APIError({
          status: 401,
          message:
            "Unauthorized: Please sign up as a seller to perform this action.",
        })
      );
    }

    next();
  };
};

export default verifySellerStatus;
