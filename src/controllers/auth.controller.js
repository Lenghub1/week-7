import catchAsync from "../utils/catchAsync.js";
import authService from "../services/auth.service.js";
import sendEmailWithNodemailer from "../utils/email.js";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";

const authController = {
  // Signup
  // 1. Get user data from signup
  // 2. Sign token (JWT)
  // 3. Create email data along with the token to client side
  // 4. Create new user (Temporary)
  signup: catchAsync(async (req, res, next) => {
    const data = req.body;
    const token = await authService.signup.signTokenForActivateAccount(data);
    const emailData = authService.signup.createEmail(token, data);
    const resultSendEmail = await sendEmailWithNodemailer(emailData);
    await authService.signup.createNewUser(res, next, resultSendEmail, data);
  }),

  // Resend Email Activate Account
  // 1. Get user's data
  // 2. Sign new token (JWT)
  // 3. Create email data along with the token to client side
  // 4. Send Email again
  resendActivationEmail: catchAsync(async (req, res, next) => {
    const data = req.user;
    const token = await authService.signup.signTokenForActivateAccount(data);
    const emailData = authService.signup.createEmail(token, data);
    const resultSendEmail = await sendEmailWithNodemailer(emailData);
    authService.signup.respondResendEmail(res, next, resultSendEmail);
  }),

  // Activate Account
  // 1. Receive JWT from client
  // 2. Verify the JWT
  // 3. Activate account by set active to true
  // 4. Move to next middleware for hanle generate access and refresh tokens
  accountActivation: catchAsync(async (req, res, next) => {
    const data = req.body;
    const user = await authService.signup.activateAccount(next, data);
    req.user = user;
    next();
  }),

  // Login
  // 1. Get user data from login
  // 2. Verify user
  // 3. Move to next middleware for hanle generate access and refresh tokens
  loginWithEmailPassword: catchAsync(async (req, res, next) => {
    const data = req.body;
    const user = await authService.login.verifyUserByEmailAndPassword(
      data,
      next
    );
    req.user = user;
    next();
  }),

  // Log in with google

  googleSignIn: catchAsync(async (req, res, next) => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const { idToken } = req.body;
    client
      .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
      .then(async (response) => {
        console.log("GOOGLE Login response", response.payload);
        const { email_verified, given_name, family_name, email, picture } =
          response.payload;
        if (email_verified) {
          const user = await User.findOne({ email });
          if (user) {
            req.user = user;
            return next();
          }
          // If there is no user, create new user
          const password = email + process.env.ACCESS_TOKEN_SECRET; // create password for new user
          console.log(password);
          const newUser = new User({
            firstName: given_name,
            lastName: family_name,
            profilePicture: picture,
            password,
            email,
            active: true,
          });
          console.log(newUser);
          await newUser.save({ validateBeforeSave: false });

          req.user = user;
          return next();
        }
        return next(
          new APIError({
            status: 400,
            message:
              "Google login failed. Please try again later or choose another method.",
          })
        );
      });
  }),

  // Refresh Token
  // 1. Get cookie
  // 2. Verify Session
  // 3. Verify JWT
  // 4. Sign new access token
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
    const data = req.body;
    const user = await authService.forgotPassword.verifyUserByEmail(next, data);
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const emailData = authService.forgotPassword.createEmail(data, resetToken);
    const resultSendEmail = sendEmailWithNodemailer(emailData);
    authService.forgotPassword.respondSendEmail(res, next, resultSendEmail);
  }),

  // Resend Email Reset Password
  // 1. Get user from middleware
  // 2. Sign new token
  // 3. Create new email data
  // 4. Send email again
  resendEmailResetPassword: catchAsync(async (req, res, next) => {
    const user = req.user;
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const emailData = authService.forgotPassword.createEmail(user, resetToken);
    const resultSendEmail = sendEmailWithNodemailer(emailData);
    authService.forgotPassword.respondSendEmail(res, next, resultSendEmail);
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

  // Update Password
  // 1. Get current password and new password
  // 2. Find user in data base
  // 3. Verify current password and Update new password
  updatePassword: catchAsync(async (req, res, next) => {
    const data = req.body;
    const user = await authService.updatePassword.getCurrentUser(req);
    await authService.updatePassword.verifyAndUpdatePassword(
      res,
      user,
      data,
      next
    );
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

  // Reject seller
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

  // Enable 2FA
  // 1. Find User in database
  // 2. Enable 2FA
  enable2FA: catchAsync(async (req, res, next) => {
    const user = await authService.enable2FA.verifyUserEnable2FA(req, next);
    await authService.enable2FA.enable(res, user);
  }),

  // Disable 2FA
  // 1. Find User in database
  // 2. Disable 2FA
  disable2FA: catchAsync(async (req, res, next) => {
    const user = await authService.disable2FA.verifyUserDisable2FA(req, next);
    await authService.disable2FA.disable(res, user);
  }),

  // Logout
  // 1. Get cookie
  // 2. Check jwt in Cookie
  // 3. Check Session in db
  // 4. Delete Session contain refresh token in db
  // 5. Clear cookie
  logOut: catchAsync(async (req, res, next) => {
    const cookies = req.cookie;
    const refreshTokenLogOut = await authService.logOut.checkJWT(next, cookies);
    await authService.logOut.clearCookieLogOut(res, next, refreshTokenLogOut);
  }),
};

export default authController;
