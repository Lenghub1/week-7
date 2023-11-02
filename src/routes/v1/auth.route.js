import express from "express";
import { createAuthValidator } from "../../validators/auth.validator.js";
import { runValidation } from "../../validators/index.js";
import { authController } from "../../controllers/auth.controller.js";

const router = express.Router();

router
  .route("/signup")
  .post(createAuthValidator, runValidation, authController.signup);

export default router;
