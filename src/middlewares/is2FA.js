import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import catchAsync from "../utils/catchAsync.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcryptjs";
import sendEmailWithNodemailer from "../utils/email.js";

const is2FA = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(
      new APIError({
        status: 404,
        message: "User not found.",
      })
    );
  } else if (user && user.enable2FA === false) {
    return next();
  }
  const OTP = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const salt = await bcrypt.genSalt(10);
  user.OTP = await bcrypt.hash(OTP, salt);
  user.OTPExpires = Date.now() + 10 * 60 * 1000;
  await user.save();
  const emailData = {
    from: "RUKHAK TEAM <example@gmail.com>",
    to: user.email,
    subject: "2 Step Verification",
    html: `<h1>Please use numbers below to continue to the app:</h1>
            <p>${OTP}</p>`,
  };
  const resultSendEmail = await sendEmailWithNodemailer(emailData);
  if (!resultSendEmail) {
    return next(
      new APIError({
        status: 500,
        message: "Internal server error.",
      })
    );
  }

  res.status(200).json({
    message: "Please confirm your OTP code.",
  });
});

export default is2FA;
