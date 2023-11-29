import factory from "./factory.js";
import checkoutService from "../services/checkout.service.js";

const checkoutController = {
  getAllStripe: factory.getAll(checkoutService.getAllStripeProducts),
  createStripe: factory.create(checkoutService.createCheckoutSession),
};

export default checkoutController;
