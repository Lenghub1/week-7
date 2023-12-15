import express from "express";
import orderController from "@/controllers/order.controller.js";
import isAuth from "../../middlewares/authMiddlewares/isAuth.js";
const router = express.Router();

router.use(isAuth);

router
  .route("/")
  .get(orderController.getAllOrder)
  .post(orderController.addOrder);

export default router;
