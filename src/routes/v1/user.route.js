import express from "express";
import usersProductController from "../../controllers/usersProduct.controller.js";

const router = express.Router();

router.route("/products").get(usersProductController.getAllProducts);

router.route("/new").get(usersProductController.getNewProducts);
router.route("/top").get(usersProductController.getTopProducts);

export default router;
