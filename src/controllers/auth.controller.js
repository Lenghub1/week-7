import catchAsync from "../utils/catchAsync.js";
import authService from "../services/auth.service.js";

const authController = {
  // Signup
  // 1. Get user data from signup
  // 2. Sign new JWT
  // 3. Send email with a link include JWT to let user activate account
  signup: catchAsync(async (req, res, next) => {
    const data = req.body;
    const token = authService.signup.signTokenForActivateAccount(data);
    const { email } = data;
    authService.signup.sendEmailActivateAccount(req, res, token, email);
  }),

  // Activate Account
  // 1. Receive JWT from client
  // 2. Verify the JWT
  // 3. Activate account by adding data to database
  accountActivation: catchAsync(async (req, res, next) => {
    const data = req.body;
    authService.signup.verifyJWTForActivateAccount(req, res, next, data);
  }),

  // Login
  // 1. Get user data from login
  // 2. Verify user
  // 3. Move to next middleware for hanle assign access and refresh tokens
  loginWithEmailPassword: catchAsync(async (req, res, next) => {
    const data = req.body;
    const user = await authService.login.verifyUserByEmailAndPassword(
      data,
      next
    );
    req.user = user;
    next();
  }),

  // Refresh Token
  // 1. Get cookie
  // 2. Verify JWT
  // 3. Sign new access token
  refreshToken: catchAsync(async (req, res, next) => {
    const cookies = req.cookies;
    const refreshToken = await authService.refreshToken.checkCookie(
      cookies,
      next
    );
    const session = await authService.refreshToken.verifySession(
      refreshToken,
      next
    );
    authService.refreshToken.verifyRefreshToken(
      req,
      res,
      next,
      refreshToken,
      session
    );
  }),

  // Forgot Password
  // 1. Get user's email
  // 2. Verify user by email
  // 3. Generate a random reset token
  // 4. Send it to user's email
  forgotPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await authService.forgotPassword.verifyUserByEmail(
      email,
      next
    );
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    authService.forgotPassword.sendEmailResetPassword(
      req,
      res,
      resetToken,
      email
    );
  }),

  // Reset Password
  // 1. Get reset token
  // 2. Hash reset token and compare to user hashed token in db
  // 3. Create new password
  resetPassword: catchAsync(async (req, res, next) => {
    const data = req.body;
    const hashedToken = authService.forgotPassword.hashToken(data);
    const user = await authService.forgotPassword.verifyUserByToken(
      hashedToken,
      next
    );
    await authService.forgotPassword.createNewPassword(res, data, user);
  }),

  // Signup as Seller
  // 1. Get sign up data
  // 2. Find the user with the request
  // 3. Replace user document with new document in db as seller
  signupSeller: catchAsync(async (req, res, next) => {
    const sellerData = req.body;
    const user = await authService.signupSeller.verifyUserById(req, res, next);
    await authService.signupSeller.createSeller(req, res, sellerData, user);
  }),

  // Approve seller
  // 1. Get seller id from params
  // 2. Check for seller in database
  // 3. Update seller status to active
  approveSeller: catchAsync(async (req, res, next) => {
    const sellerId = req.params.sellerId;
    const action = "approve"; // For reuseable updateSellerStatus function
    const seller = await authService.signupSeller.verifySeller(sellerId, next);
    await authService.signupSeller.updateSellerStatus(
      req,
      res,
      next,
      seller,
      action
    );
  }),

  // Approve seller
  // 1. Get seller id from params
  // 2. Check for seller in database
  // 3. Update seller status and role
  rejectSeller: catchAsync(async (req, res, next) => {
    const sellerId = req.params.sellerId;
    const action = "reject";
    const seller = await authService.signupSeller.verifySeller(sellerId, next);
    await authService.signupSeller.updateSellerStatus(
      req,
      res,
      next,
      seller,
      action
    );
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
