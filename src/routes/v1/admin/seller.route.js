import express from "express";
import sellerControllerAdmin from "../../../controllers/admin/seller.controller.js";

const router = express.Router();

router.route("/sellers").get(sellerControllerAdmin.searchSeller);

export default router;
