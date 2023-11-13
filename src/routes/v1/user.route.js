import express from "express";
import controller from "../../controllers/user.controller.js";
import isAuth from "../../middlewares/isAuth.js";
import verifyRoles from "../../middlewares/verifyRoles.js";

const router = express.Router();

router.route("/").get(isAuth, verifyRoles("admin"), controller.getAllUsers);

export default router;
