import express from "express";
import cartController from "../../controllers/cart.controller";

const router = express.Router();

router
  .route("/")
  .get(cartController.getAllCarts)
  .post(cartController.addToCart);

router
  .route("/:id")
  .get(cartController.getCart)
  .patch(cartController.updateCart)
  .delete(cartController.deleteCart);

export default router;
