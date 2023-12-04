import express from "express";
import { runValidation } from "../../validators/index.js";
import { createNameValidator } from "../../validators/name.validator.js";
import { createPasswordValidator } from "../../validators/password.validator.js";
import handleSignIn from "../../middlewares/handleSignIn.js";
import controller from "../../controllers/user.controller.js";
import isAuth from "../../middlewares/isAuth.js";
import verifyOTPCode from "../../middlewares/verifyOTPCode.js";
import { createEmailValidator } from "../../validators/email.validator.js";
import verifyRoles from "../../middlewares/verifyRoles.js";

const router = express.Router();

// Get all users
router.route("/").get(isAuth, verifyRoles("admin"), controller.getAllUsers);

router.route("/:userId").get(isAuth, controller.getOneUser);
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
