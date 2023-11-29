import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import catchAsync from "../utils/catchAsync.js";
import bcrypt from "bcryptjs";

const verify2FACode = catchAsync(async (req, res, next) => {
  const { OTP, email, loginMethod } = req.body;
  const user = await User.findOne({
    email,
    OTPExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new APIError({
        status: 400,
        message: "OTP code is expired!",
      })
    );
  }
  const resultCompare = await bcrypt.compare(OTP, user.OTP);
  if (!resultCompare) {
    return next(
      new APIError({
        status: 500,
        message: "Incorrect OTP code.",
      })
    );
  }
  user.OTP = undefined;
  user.OTPExpires = undefined;
  await user.save();
  req.user = user;
  req.user.loginMethod = loginMethod || undefined; // undefined because user not log in but only verify the code (enable 2FA)
  return next();
});

export default verify2FACode;
