import express from "express";
import paymentController from "@/controllers/checkout.controller.js";

const router = express.Router();

router.post("/create", paymentController.createPayment);
router.get("/execute", paymentController.executePayment);

export default router;
