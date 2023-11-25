import express from "express";
import controller from "../../controllers/seller.controller.js";
import {
  createProductValidator,
  sellerProductQueryValidator,
  updateProductValidator,
} from "../../validators/product.validator.js";
import { runValidation } from "../../validators/index.js";
import { uploadProductMedia } from "../../middlewares/uploadFiles.js";

const router = express.Router();

router
  .route("/products")
  .post(
    uploadProductMedia,
    createProductValidator,
    runValidation,
    controller.createProduct
  )
  .get(sellerProductQueryValidator, runValidation, controller.getOwnProducts);

router
  .route("/products/:id")
  .get(controller.getOwnProductDetail)
  .patch(
    uploadProductMedia,
    updateProductValidator,
    runValidation,
    controller.updateProduct
  )
  .delete(controller.deleteProduct);

export default router;
