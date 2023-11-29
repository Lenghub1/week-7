import express from "express";
import addressController from "../../controllers/address.controller.js";

const router = express.Router();

router
  .route("/")
  .get(addressController.getAllAddresses)
  .post(addressController.createAddress);

router
  .route("/:id")
  .get(addressController.getAddress)
  .patch(addressController.updateAddress)
  .delete(addressController.deleteAddress);

export default router;
