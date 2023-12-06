import dotenv from "dotenv";
import Order from "@/models/order.model.js";
import paypal from "paypal-rest-sdk";

dotenv.config();

const checkoutService = {
  mode: process.env.MODE,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,

  async getAllPayment() {
    const payment = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
      },
      transactions: [
        {
          item_list: {
            items: Order.cartItems.map((cartItem) => ({
              name: cartItem.productId.title,
              sku: cartItem.productId.sku,
              price: cartItem.itemPrice.toFixed(2),
              currency: "USD",
              quantity: cartItem.quantity,
              total: totalPrice,
            })),
          },
        },
      ],
    };
    return payment;
  },

  async createPayment() {
    const paypalPayment = paypal.payment(
      create_payment_json,
      (error, payment) => {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              res.redirect(payment.links[i].href);
            }
          }
        }
      }
    );
    return paypalPayment;
  },
};

export default checkoutService;
