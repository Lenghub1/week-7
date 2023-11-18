import express from "express";
import { createSignupValidator } from "../../validators/signup.validator.js";
import { createLoginValidator } from "../../validators/login.validator.js";
import { createEmailValidator } from "../../validators/email.validator.js";
import { createPasswordValidator } from "../../validators/password.validator.js";
import { runValidation } from "../../validators/index.js";
import controller from "../../controllers/auth.controller.js";
import handleSingIn from "../../middlewares/handleSignIn.js";
import isAuth from "../../middlewares/isAuth.js";
import verifyRoles from "../../middlewares/verifyRoles.js";
import isRecentlySignup from "../../middlewares/isRecentlySignup.js";
import isRecentlyForgotPwd from "../../middlewares/isRecentlyForgotPwd.js";
const router = express.Router();

router
  .route("/signup")
  .post(createSignupValidator, runValidation, controller.signup);

router
  .route("/resend-email-activation")
  .post(isRecentlySignup, controller.resendActivationEmail);

router
  .route("/account-activation")
  .post(controller.accountActivation, handleSingIn);

router
  .route("/login")
  .post(
    createLoginValidator,
    runValidation,
    controller.loginWithEmailPassword,
    handleSingIn
  );

router
  .route("/forgot-password")
  .post(createEmailValidator, runValidation, controller.forgotPassword);

router
  .route("/resend-email-reset-password")
  .post(isRecentlyForgotPwd, controller.resendEmailResetPassword);

router
  .route("/reset-password")
  .patch(createPasswordValidator, runValidation, controller.resetPassword);

router
  .route("/update-password")
  .patch(
    createPasswordValidator,
    runValidation,
    isAuth,
    controller.updatePassword
  );

router
  .route("/signup-seller")
  .put(isAuth, verifyRoles("user"), controller.signupSeller);

router
  .route("/approved/:sellerId")
  .patch(isAuth, verifyRoles("admin"), controller.approveSeller);

router
  .route("/rejected/:sellerId")
  .patch(isAuth, verifyRoles("admin"), controller.rejectSeller);

router.route("/refresh").get(controller.refreshToken);

router.route("/logout").post(isAuth, controller.logOut);

export default router;
