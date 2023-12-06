import factory from "./factory.js";
import checkoutService from "../services/checkout.service.js";

const checkoutController = {
  allPayment: factory.getAll(checkoutService.getAllPayment),
  createStripe: factory.create(checkoutService.createPayment),
};

export default checkoutController;
