import express from "express";
import productControllerAdmin from "@/controllers/admin/product.controller.js";
import {
  createProductValidator,
  sellerProductQueryValidator,
} from "@/validators/product.validator.js";
import { runValidation } from "@/validators/index.js";
import { uploadProductMedia } from "@/middlewares/uploadFiles.js";
import { editProductMedia } from "@/middlewares/editFiles.js";
import { resizeProductImage } from "@/middlewares/resizeProductImage.js";

const router = express.Router();

router
  .route("/")
  .post(
    uploadProductMedia,
    resizeProductImage,
    createProductValidator,
    runValidation,
    productControllerAdmin.createProduct
  )
  .get(
    sellerProductQueryValidator,
    runValidation,
    productControllerAdmin.getProducts
  );

router
  .route("/:id")
  .get(productControllerAdmin.getProductById)
  .patch(
    editProductMedia,
    resizeProductImage,
    productControllerAdmin.updateProduct
  );

export default router;
