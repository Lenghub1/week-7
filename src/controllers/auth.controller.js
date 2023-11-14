import catchAsync from "../utils/catchAsync.js";
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

  // Refresh Token
  // 1. Get cookie
  // 2. Verify JWT
  // 3. Sign new access token
  refreshToken: catchAsync(async (req, res, next) => {
    const cookies = req.cookies;
    const refreshToken = await authService.checkCookie(cookies, next);
    const session = await authService.verifySession(refreshToken, next);
    authService.verifyRefreshToken(req, res, next, refreshToken, session);
  }),

  // Signup as Seller
  // 1. Get sign up data
  // 2. Find the user with the request
  // 3. Replace user document with new document in db as seller
  signupSeller: catchAsync(async (req, res, next) => {
    const sellerData = req.body;
    const user = await authService.verifyUserById(req, res, next);
    await authService.createSeller(req, res, sellerData, user);
  }),

  // Logout
  // 1. Get cookie
  // 2. Check jwt in Cookie
  // 3. Check Session in db
  // 4. Delete Session contain refresh token in db
  // 5. Clear cookie
  logOut: catchAsync(async (req, res, next) => {
    const cookies = req.cookie;
    const refreshTokenLogOut = await authService.checkJWT(
      req,
      res,
      next,
      cookies
    );
    await authService.clearCookieLogOut(req, res, next, refreshTokenLogOut);
  }),
};
export default authController;
