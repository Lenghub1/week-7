import express from "express";
import adminController from "../../controllers/admin.controller.js";
import {
  createProductValidator,
  sellerProductQueryValidator,
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
    adminController.createProduct
  )
  .get(sellerProductQueryValidator, runValidation, adminController.getProducts);

router.route("/products/:id").get(adminController.getProductById);

router.route("/sellers").get(adminController.searchSeller);

export default router;
