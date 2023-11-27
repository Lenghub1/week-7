import express from "express";
import stripeController from "../../controllers/stripe.controller.js";

const router = express.Router();

router
    .route("/")
    .get(stripeController.getAllStripe)
    .post(stripeController.createStripe);

export default router;
