import express from "express";
import controller from "../../controllers/seller.controller.js";
import {
  createProductValidator,
  sellerProductQueryValidator,
  updateProductValidator,
} from "../../validators/product.validator.js";
import { runValidation } from "../../validators/index.js";
import { uploadProductMedia } from "../../middlewares/uploadFiles.js";
import isAuth from "../../middlewares/isAuth.js";
import verifyRoles from "../../middlewares/verifyRoles.js";
import verifySellerStatus from "../../middlewares/verifySellerStatus.js";

const router = express.Router();

const ROLE = "seller";

router
  .route("/products")
  .post(
    isAuth,
    verifyRoles(ROLE),
    verifySellerStatus(),
    uploadProductMedia,
    createProductValidator,
    runValidation,
    controller.createProduct
  )
  .get(
    isAuth,
    verifyRoles(ROLE),
    verifySellerStatus(),
    sellerProductQueryValidator,
    runValidation,
    controller.getOwnProducts
  );

router
  .route("/products/:id")
  .get(
    isAuth,
    verifyRoles(ROLE),
    verifySellerStatus(),
    controller.getOwnProductDetail
  )
  .patch(
    isAuth,
    verifyRoles(ROLE),
    verifySellerStatus(),
    uploadProductMedia,
    updateProductValidator,
    runValidation,
    controller.updateProduct
  )
  .delete(
    isAuth,
    verifyRoles(ROLE),
    verifySellerStatus(),
    controller.deleteProduct
  );

export default router;
