import express from "express";
import usersProductController from "../../controllers/usersProduct.controller.js";

const router = express.Router();

router.route("/products").get(usersProductController.getAllProducts);

export default router;
