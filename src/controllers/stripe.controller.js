import factory from "./factory.js";
import stripService from "../services/stripe.service.js";

const stripeController = {
  createStripe: factory.create(stripService.createCheckoutSession),
};

export default stripeController;
