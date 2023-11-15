import express from "express";
import { createSignupValidator } from "../../validators/signup.validator.js";
import { createLoginValidator } from "../../validators/login.validator.js";
import { runValidation } from "../../validators/index.js";
import controller from "../../controllers/auth.controller.js";
import handleSingIn from "../../middlewares/handleSignIn.js";
import isAuth from "../../middlewares/isAuth.js";
import verifyRoles from "../../middlewares/verifyRoles.js";
const router = express.Router();

router
  .route("/signup")
  .post(createSignupValidator, runValidation, controller.signup);

router.route("/account-activation").post(controller.accountActivation);

router.route("/refresh").get(controller.refreshToken);

router
  .route("/login")
  .post(
    createLoginValidator,
    runValidation,
    controller.loginWithEmailPassword,
    handleSingIn
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

router.route("/logout").get(controller.logOut);

export default router;
