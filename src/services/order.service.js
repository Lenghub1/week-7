import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import APIError from "../utils/APIError.js";
import sendEmailWithNodemailer from "@/utils/email.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "@/models/user.model.js";
import Notification from "@/models/notification.model.js";
import { generateCartItemHTML } from "@/utils/emailTemplate.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const orderService = {
  async getAllOrders() {
    const orders = await Order.find({});
    if (!orders) {
      throw new APIError({ status: 404, message: "Order not found." });
    }
    return orders;
  },
  async getOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new APIError({ status: 404, message: "Order not found." });
    }
    return order;
  },
  async updateOrder(orderId, orderBody) {
    const order = await Order.findByIdAndUpdate(orderId, orderBody, {
      new: true,
    });
    if (!order) {
      throw new APIError({ status: 404, message: "Order not found." });
    }

    const status = order.shipping[0].status;
    const user = await User.findById(order.userId);

    let emailSubject = "";
    let emailBody = "";

    switch (status) {
      case "approved":
        emailSubject = "Order Approved";
        emailBody = "Your Order has been approved by the seller.";
        break;
      case "shipped":
        emailSubject = "Order Shipped";
        emailBody = "Your Order has been shipped.";
        break;
      case "cancelled":
        emailSubject = "Order Cancelled";
        emailBody = "Your Order has been cancelled.";
        break;
      case "delivered":
        emailSubject = "Order Delivered";
        emailBody = "Your Order has been delivered.";
        break;
      case "refunded":
        emailSubject = "Order Refunded";
        emailBody = "Your Order has been refunded.";
        break;
      default:
        // Handle any other status if needed
        break;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: emailSubject,
      html: emailBody,
    };

    if (
      status === "approved" ||
      status === "shipped" ||
      status === "cancelled" ||
      status === "delivered" ||
      status === "refunded"
    ) {
      const emailSent = await sendEmailWithNodemailer(mailOptions);

      if (!emailSent) {
        throw new APIError({ status: 500, message: "Failed to send email." });
      }
    }

    return order;
  },

  async deleteOrder(orderId) {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      throw new APIError({ status: 404, message: "Order not found." });
    }
    return order;
  },
  async createOrder(orderBody) {
    const cartItemsWithDetails = await Promise.all(
      orderBody.cartItems.map(async (cartItem) => {
        const product = await Product.findById(cartItem.productId);

        console.log(product);

        return {
          ...cartItem,
          productTitle: product.title,
          itemPrice: product.unitPrice,
          totalPrice: product.unitPrice * cartItem.quantity,
          sellerId: product.sellerId,
        };
      })
    );

    const totalPrice = cartItemsWithDetails.reduce(
      (total, cartItem) => total + cartItem.quantity * cartItem.itemPrice,
      0
    );

    orderBody.totalPrice = totalPrice.toFixed(2);

    const sellerId = cartItemsWithDetails[0].sellerId;
    const admin = new mongoose.Types.ObjectId();
    const entityId = new mongoose.Types.ObjectId();

    const user = await User.findById(orderBody.userId);

    if (!user) {
      throw new APIError({ status: 404, message: "User not found." });
    }

    const emailTemplate = await fs.promises.readFile(
      path.join(__dirname, "..", "emails", "confirmationOrder.html"),
      "utf-8"
    );
    console.log(cartItemsWithDetails);

    const cartItemsHTML = cartItemsWithDetails
      .map(generateCartItemHTML)
      .join("");

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Order Confirmation",
      html: emailTemplate
        .replace("${cartItemsWithDetails}", `<ul>${cartItemsHTML}</ul>`)
        .replace("${totalPrice}", totalPrice.toFixed(2)),
    };

    const notification = await Notification.insertNotification(
      sellerId,
      admin,
      "Order Notification",
      "Got new order",
      "Product order",
      entityId
    );
    const order = await Order.create(orderBody);

    if (!order) {
      throw new APIError({ status: 404, message: "Order not found." });
    }

    // Check if the order was successfully created before sending the email
    if (order) {
      const emailSent = await sendEmailWithNodemailer(mailOptions);

      if (!emailSent) {
        throw new APIError({ status: 500, message: "Failed to send email." });
      }
    }

    return order;
  },
};

export default orderService;
