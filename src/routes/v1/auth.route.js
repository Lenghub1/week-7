import express from "express";
import { createSignupValidator } from "../../validators/signup.validator.js";
import { createLoginValidator } from "../../validators/login.validator.js";
import { createEmailValidator } from "../../validators/email.validator.js";
import { createPasswordValidator } from "../../validators/password.validator.js";
import { runValidation } from "../../validators/index.js";
import controller from "../../controllers/auth.controller.js";
import handleSignIn from "../../middlewares/handleSignIn.js";
import isAuth from "../../middlewares/isAuth.js";
import verifyRoles from "../../middlewares/verifyRoles.js";
import isRecentlySignup from "../../middlewares/isRecentlySignup.js";
import isRecentlyForgotPwd from "../../middlewares/isRecentlyForgotPwd.js";
import is2FA from "../../middlewares/is2FA.js";
import verify2FACode from "../../middlewares/verify2FACode.js";
import isRecently2FA from "../../middlewares/isRecently2FA.js";

const router = express.Router();

// Sign up with email and password
router
  .route("/signup")
  .post(createSignupValidator, runValidation, controller.signup);

// Activate account
router
  .route("/account-activation")
  .post(controller.accountActivation, handleSignIn);

// Login with email and password
router
  .route("/login")
  .post(
    createLoginValidator,
    runValidation,
    controller.loginWithEmailPassword,
    is2FA,
    handleSignIn
  );

// Login with Google
router.route("/login-google").post(controller.googleSignIn, handleSignIn);

// Verify OTP code
router.route("/verify2FA").post(verify2FACode, handleSignIn);

// Forgot password
router
  .route("/forgot-password")
  .post(createEmailValidator, runValidation, controller.forgotPassword);

// Reset password
router
  .route("/reset-password")
  .patch(createPasswordValidator, runValidation, controller.resetPassword);

// Sign up as seller
router
  .route("/signup-seller")
  .put(isAuth, verifyRoles("user"), controller.signupSeller);

// Handle approve or reject seller
router
  .route("/:sellerId/:action")
  .patch(isAuth, verifyRoles("admin"), controller.handleSeller);

// Resend email to activate account
router
  .route("/resend-email-activation")
  .post(isRecentlySignup, controller.resendActivationEmail);

// Resend email to reset password
router
  .route("/resend-email-reset-password")
  .post(isRecentlyForgotPwd, controller.resendEmailResetPassword);

// Resend email for OTP code
router
  .route("/resend-email-otp")
  .post(isRecently2FA, controller.resendEmailOTP);

// Refresh access token
router.route("/refresh").get(controller.refreshToken);

// Logout
router.route("/logout").post(controller.logOut);

export default router;
