import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import APIError from "../utils/APIError.js";
import authService from "../services/auth.service.js";

// Signup
// 1. Get user data from signup
// 2. Sign new JWT
// 3. Send email with a link include JWT to let user activate account
const signup = catchAsync(async (req, res, next) => {
  const { email, firstName, lastName, password } = req.body;

  const token = authService.signTokenForActivateAccount(
    email,
    firstName,
    lastName,
    password
  );

  authService.sendEmailActivateAccount(req, res, token, email);
});

// Activate Account
// 1. Receive JWT from client
// 2. Verify the JWT
// 3. Activate account by adding data to database
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

  authService.verifyJWTForActivateAccount(req, res, next, token);
});

// Login
// 1. Get user data from login
// 2. Verify user
// 3. Move to next middleware
const loginWithEmailPassword = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.verifyPassword(password))) {
    return next(
      new APIError({
        status: 400,
        message: "Email or password is incorrected.", // For more secure and prevent malicious from knowing which field they input wrong.
      })
    );
  }

  req.user = user;
  next();
});

// Refresh Access Token
// 1. Get cookie
// 2. Clear cookie on client
// 4. Verify JWT
// 5. Sign new access and refresh tokens
const refreshToken = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  console.log(JSON.stringify(cookies));

  if (!cookies?.jwt) {
    return next(
      new APIError({
        status: 401,
        message:
          "Unauthorized: Access is denied due to invalid credentials. Please check your login details and try again.",
      })
    );
  }

  const refreshToken = cookies.jwt;

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  const session = await session.findOne({ refreshToken });
  console.log(session);
  if (!session) {
    return next(
      new APIError({
        status: 403,
        message: "Forbidden",
      })
    );
  }

  authService.verifyRefreshToken(req, res, next, refreshToken, session);
});

export const authController = {
  signup,
  account_activation,
  loginWithEmailPassword,
  refreshToken,
};
