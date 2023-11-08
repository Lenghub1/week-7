import express from "express";
import { createSignupValidator } from "../../validators/signup.validator.js";
import { createLoginValidator } from "../../validators/login.validator.js";
import { runValidation } from "../../validators/index.js";
import { authController } from "../../controllers/auth.controller.js";
import handleSingIn from "../../middlewares/handleSignIn.js";
import isAuth from "../../middlewares/isAuth.js";
const router = express.Router();

router
  .route("/signup")
  .post(createSignupValidator, runValidation, authController.signup);

router.route("/account-activation").post(authController.account_activation);

router.route("/refresh").get(authController.refreshToken);

router
  .route("/login")
  .post(
    createLoginValidator,
    runValidation,
    authController.loginWithEmailPassword,
    handleSingIn
  );
export default router;
