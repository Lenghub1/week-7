import catchAsync from "../utils/catchAsync.js";
import Session from "../models/session.model.js";
import authService from "../services/auth.service.js";

// Handle sign in
// 1. Sign access and refresh tokens
// 2. Save to database
// 3. Create secure cookie with refresh token
// 4. Send authorization access token to client
const handleSignIn = catchAsync(async (req, res, next) => {
  const accessToken = authService.signAccessToken(req.user._id);
  const refreshToken = authService.signRefreshToken(req.user._id);
  await Session.create({
    userId: req.user._id,
    accessToken,
    refreshToken,
    loginAt: Date.now(),
  });
  const expireationTime = process.env.COOKIES_EXPIRES * 24 * 60 * 60 * 1000;
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: expireationTime,
  });

  res.status(200).json({
    message: "Login succeed.",
    data: {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      signupMethod: req.user.signupMethod,
      accessToken,
    },
  });
});

export default handleSignIn;
