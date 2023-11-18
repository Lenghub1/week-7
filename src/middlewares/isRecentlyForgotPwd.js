import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import catchAsync from "../utils/catchAsync.js";

const isRecentlyForgotPwd = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new APIError({
        status: 404,
        message: "Email is required to send email to reset password.",
      })
    );
  } else if (!user.forgotPasswordExpires) {
    return next(
      new APIError({
        status: 400,
        message: "You did not request to reset password.",
      })
    );
  }
  req.user = user;
  return next();
});

export default isRecentlyForgotPwd;
