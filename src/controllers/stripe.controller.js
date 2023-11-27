import factory from "./factory.js";
import stripService from "../services/stripe.service.js";

const stripeController = {
  getAllStripe: factory.getAll(stripService.getAllStripeProducts),
  createStripe: factory.create(stripService.createCheckoutSession),
};

export default stripeController;
