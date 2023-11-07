import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";

import APIError from "../utils/APIError.js";
import authService from "../services/auth.service.js";

// Signup
// 1. Get the signup data
// 2. Sign JWT for embed the data after click signup
// 3. Send email with JWT
const signup = catchAsync(async (req, res, next) => {
  const { email, firstName, lastName, password } = req.body;
  const token = authService.signAccountActivateToken(
    email,
    password,
    firstName,
    lastName
  );

  authService.sendEmailActivateAccount(req, res, token, email);
});

// Activate Account
// 1. Get the JWT send from client after click activate
// 2. Check if token exist or not
// 3. Verify the JWT
const account_activation = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return next(
      new APIError({
        status: 401,
        message: "Token is not defined! Please signup again.",
      })
    );
  }
  authService.verifyJWT(req, res, next, token);
});

// Login
// 1. Get cookies and email and password from request
// 2. Find user document with that email and password
// 3. If found, assing JWT (access and refresh)
const login = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  // 1. Check if there is no user found in database or the password is incorrect
  if (!user || !(await user.verifyPassword(password))) {
    return next(
      new APIError({
        status: 400,
        message: "Email or password is incorrected.", // For more secure and prevent malicious from knowing which field they input wrong.
      })
    );
  }

  // Sign access and refresh tokens
  const accessToken = jwt.sign(
    { _id: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    }
  );
  const newRefreshToken = jwt.sign(
    { _id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    }
  );
  // Create an array to store new refresh token
  let newRefreshTokenArray = [];
  if (cookies?.jwt)
    newRefreshTokenArray = user.refreshToken.filter(
      (rt) => rt !== cookies?.jwt
    );
  else if (!cookies?.jwt) newRefreshTokenArray = user.refreshToken;

  // 4. Detect refresh token reuse
  if (cookies?.jwt) {
    const refreshToken = cookies.jwt;
    const foundToken = await User.findOne({ refreshToken });

    // Detected refresh token is really reuse
    if (!foundToken) {
      // clear all previos refresh tokens
      newRefreshTokenArray = [];
    }

    // Not detected
    res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "None" });
  }

  // 5. Saving new refresh token
  user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  await user.save();

  // 6. Create secure cookie with refresh token
  res.cookie("jwt", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: process.env.COOKIES_EXPIRES * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "login succeed.",
    accessToken,
  });
});

export const authController = { signup, account_activation, login };
