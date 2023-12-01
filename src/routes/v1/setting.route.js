import express from "express";
import { runValidation } from "../../validators/index.js";
import { createNameValidator } from "../../validators/name.validator.js";
import { createPasswordValidator } from "../../validators/password.validator.js";
import handleSignIn from "../../middlewares/handleSignIn.js";
import controller from "../../controllers/setting.controller.js";
import isAuth from "../../middlewares/isAuth.js";
import verifyOTPCode from "../../middlewares/verifyOTPCode.js";
import { createEmailValidator } from "../../validators/email.validator.js";

const router = express.Router();

// Update first or last name
router
  .route("/name")
  .patch(createNameValidator, runValidation, isAuth, controller.updateName);

// Update password
router
  .route("/update-password")
  .patch(
    createPasswordValidator,
    runValidation,
    isAuth,
    controller.updatePassword,
    handleSignIn
  );

// Enable/Disable 2FA by user who log in by email and password
router.route("/:action/2FA/pwd").patch(isAuth, controller.enable2FAByPassword);

// Enable/Disable 2FA by oAuth user
router.route("/:action/2FA/oauth").get(isAuth, controller.enable2FAByOTP);

// Enable 2FA (after verify otp)
router
  .route("/:action/2FA/otp")
  .patch(isAuth, verifyOTPCode, controller.enable2FA);

// Log out one device
router.route("/:sessionId/logout").delete(isAuth, controller.logOutOne);

// Get all devices that user have logged in
router.route("/sessions").get(isAuth, controller.getUserSessions);

// Request to update email
router
  .route("/confirm/email")
  .post(
    createEmailValidator,
    runValidation,
    isAuth,
    controller.confirmNewEmail
  );

// Verify OTP code and update email
router
  .route("/update/email")
  .patch(isAuth, verifyOTPCode, controller.updateEmail);

// User delete account
router.route("/delete/account").patch(isAuth, controller.deleteAccount);

export default router;
