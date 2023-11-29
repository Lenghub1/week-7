import express from "express";
import checkoutController from "../../controllers/checkout.controller.js";

const router = express.Router();

router
  .route("/")
  .get(checkoutController.getAllStripe)
  .post(checkoutController.createStripe);

export default router;
