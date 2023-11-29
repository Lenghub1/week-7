import Stripe from "stripe";
import dotenv from "dotenv";
import Product from "../models/product.model.js";
dotenv.config();

const checkoutService = {
  async getAllStripeProducts() {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: `2023-10-16`,
    });
    const products = await stripe.products
      .list({ limit: 100 })
      .autoPagingEach({ limit: 10000 });
    if (!products) {
      throw new Error({ status: 404, message: "No stripe product found" });
    }
    return products;
  },

  async createCheckoutSession(cartItems) {
    const lineItems = [];

    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              productId: product.productId,
            },
            quantity: item.quantity,
          },
        });
      } else {
        throw new Error(`Product not found for id: ${item.productId}`);
      }
    }

    const session = await Stripe.checkout.session.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/your-cart`,
    });

    return session.url;
  },
};

export default checkoutService;
