import express from "express";
import checkoutController from "../../controllers/checkout.controller.js";

const router = express.Router();

router
  .route("/pay")
  .get(checkoutController.allPayment)
  .post(checkoutController.createStripe);

export default router;
