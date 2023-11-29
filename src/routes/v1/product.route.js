import express from "express";
import usersProductController from "../../controllers/product.controller.js";

const router = express.Router();

router.route("/").get(usersProductController.getByCategories);
router.route("/hot").get(usersProductController.getNewProducts);
router.route("/top").get(usersProductController.getTopProducts);

export default router;
