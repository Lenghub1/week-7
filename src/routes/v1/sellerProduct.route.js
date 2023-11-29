import express from "express";
import controller from "../../controllers/sellerProduct.controller.js";
import {
  createProductValidator,
  sellerProductQueryValidator,
} from "../../validators/product.validator.js";
import { runValidation } from "../../validators/index.js";

const router = express.Router();

// router
//   .route("/")
//   .post(createProductValidator, runValidation, controller.createProduct)
//   .get(controller.getAllProducts);

router
  .route("/")
  .get(sellerProductQueryValidator, runValidation, controller.getOwnProducts)
  .post(createProductValidator, runValidation, controller.createProduct);

router
  .route("/:id")
  .get(controller.getProduct)
  .patch(controller.updateProduct)
  .delete(controller.deleteProduct);

export default router;
