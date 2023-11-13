import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import APIError from "../utils/APIError.js";
import authService from "../services/auth.service.js";

const authController = {
  // Signup
  // 1. Get user data from signup
  // 2. Sign new JWT
  // 3. Send email with a link include JWT to let user activate account
  signup: catchAsync(async (req, res, next) => {
    const data = req.body;
    const token = authService.signTokenForActivateAccount(data);
    const { email } = data;
    authService.sendEmailActivateAccount(req, res, token, email);
  }),

  // Activate Account
  // 1. Receive JWT from client
  // 2. Verify the JWT
  // 3. Activate account by adding data to database
  accountActivation: catchAsync(async (req, res, next) => {
    const data = req.body;
    authService.verifyJWTForActivateAccount(req, res, next, data);
  }),

  // Login
  // 1. Get user data from login
  // 2. Verify user
  // 3. Move to next middleware for hanle assign access and refresh tokens
  loginWithEmailPassword: catchAsync(async (req, res, next) => {
    const data = req.body;
    const user = await authService.verifyUser(data, next);
    req.user = user;
    next();
  }),

  // Refresh Access Token
  // 1. Get cookie
  // 2. Verify JWT
  // 3. Sign new access token
  refreshToken: catchAsync(async (req, res, next) => {
    const cookies = req.cookies;
    const refreshToken = await authService.checkCookie(cookies, next);
    const session = await authService.verifySession(refreshToken, next);
    authService.verifyRefreshToken(req, res, next, refreshToken, session);
  }),
};

export default authController;
