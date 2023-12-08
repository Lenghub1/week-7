import express from "express";
import { runValidation } from "../../validators/index.js";
import { createPasswordValidator } from "../../validators/password.validator.js";
import handleSignIn from "../../middlewares/authMiddlewares/handleSignIn.js";
import controller from "../../controllers/user.controller.js";
import isAuth from "../../middlewares/authMiddlewares/isAuth.js";
import verifyOTPCode from "../../middlewares/authMiddlewares/verifyOTPCode.js";
import { createEmailValidator } from "../../validators/email.validator.js";
import verifyRoles from "../../middlewares/authMiddlewares/verifyRoles.js";
import { createSignupValidator } from "../../validators/signup.validator.js";
import verifyMe from "../../middlewares/userMiddlewares/verifyMe.js";

const router = express.Router();

// router.use(isAuth);

router
  .route("/me/:userId")
  .get(verifyMe, controller.getOneUser)
  .patch(controller.updateMe)
  .delete(verifyMe, controller.deleteAccount);

router
  .route("/update/password")
  .patch(
    createPasswordValidator,
    runValidation,
    controller.updatePassword,
    handleSignIn
  );

router.route("/update/email").patch(verifyOTPCode, controller.updateEmail);

router.route("/:action/2FA/pwd").patch(controller.enable2FAByPassword);

router.route("/:action/2FA/oauth").get(controller.enable2FAByOTP);

router.route("/:action/2FA/otp").patch(verifyOTPCode, controller.enable2FA);

router.route("/:sessionId/logout").delete(controller.logOutOne);

router
  .route("/confirm/email")
  .post(createEmailValidator, runValidation, controller.confirmNewEmail);

// Admin interact with users ----
router.use(verifyRoles("admin"));

router
  .route("/")
  .get(controller.getAllUsers)
  .post(createSignupValidator, runValidation, controller.createOneUser);

router
  .route("/:userId")
  .get(controller.getOneUser)
  .patch(controller.updateOneUser)
  .delete(controller.deleteOneUser);

export default router;
