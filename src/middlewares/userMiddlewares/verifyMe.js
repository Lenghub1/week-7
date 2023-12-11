import APIError from "../../utils/APIError.js";

const verifyMe = async (req, res, next) => {
  if (req.user._id.toString() !== req.params.userId) {
    return next(
      new APIError({
        status: 400,
        message: "You do not have permission to get other user information.",
      })
    );
  }
  return next();
};

export default verifyMe;
