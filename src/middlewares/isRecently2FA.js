import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import catchAsync from "../utils/catchAsync.js";

// Prevent someone accidentally request to resend email
const isRecently2FA = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new APIError({
        status: 401,
        message: "You not found.",
      })
    );
  } else if (!user.enable2FA) {
    return next(
      new APIError({
        status: 400,
        message: "Please enable 2 step verification.",
      })
    );
  }
  req.user = user;
  return next();
});

export default isRecently2FA;
