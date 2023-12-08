import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import APIError from "../utils/APIError.js";
import sendEmailWithNodemailer from "@/utils/email.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "@/models/user.model.js";
import Notification from "@/models/notification.model.js";
import {
  generateCartItemHTML,
  generateCartItemHTMLRow,
} from "@/utils/emailTemplate.js";
import mongoose from "mongoose";
import { getFileSignedUrl } from "../config/s3.js";
import { url } from "inspector";

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
    const cartItemsWithDetails = await Promise.all(
      order.cartItems.map(async (cartItem) => {
        const product = await Product.findById(cartItem.productId);
        const url = await getFileSignedUrl(product.imgCover);

        return {
          ...cartItem,
          productTitle: product.title,
          itemPrice: product.unitPrice,
          totalPrice: product.unitPrice * cartItem.quantity,
          sellerId: product.sellerId,
          url: url,
          productDes: product.description,
        };
      })
    );

    console.log(order);

    const cartItemsHTML = cartItemsWithDetails
      .map(generateCartItemHTMLRow)
      .join("");

    const status = order.shipping[0].status;
    const user = await User.findById(order.userId);

    const emailApprove = await fs.promises.readFile(
      path.join(__dirname, "..", "emails", "orderApproved.html"),
      "utf-8"
    );
    const emailShip = await fs.promises.readFile(
      path.join(__dirname, "..", "emails", "orderShipped.html"),
      "utf-8"
    );
    const emailDelivery = await fs.promises.readFile(
      path.join(__dirname, "..", "emails", "orderDelivered.html"),
      "utf-8"
    );
    const emailRefund = await fs.promises.readFile(
      path.join(__dirname, "..", "emails", "orderRefunded.html"),
      "utf-8"
    );
    let emailSubject = "";
    let emailBody = "";
    if (
      ![
        "pending",
        "approved",
        "shipped",
        "cancelled",
        "delivered",
        "refunded",
      ].includes(status)
    ) {
      throw new APIError({ status: 400, message: "Invalid status value." });
    }

    switch (status) {
      case "approved":
        emailSubject = "Order Approved";
        emailBody = emailApprove.replace("${orderId}", order._id);
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
        emailBody = emailDelivery
          .replace("${user}", user.firstName)
          .replace("${userEmail}", user.email)
          .replace("${cartItemsWithDetails}", `<ul>${cartItemsHTML}</ul>`)
          .replace("${total}", order.totalPrice)
          .replace("${totall}", order.totalPrice)
          .replace("${payment}", order.paymentMethod);
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
        const url = await getFileSignedUrl(product.imgCover);

        return {
          ...cartItem,
          productTitle: product.title,
          itemPrice: product.unitPrice,
          totalPrice: product.unitPrice * cartItem.quantity,
          sellerId: product.sellerId,
          url: url,
        };
      })
    );
    console.log(cartItemsWithDetails);
    const totalPrice = cartItemsWithDetails.reduce(
      (total, cartItem) => total + cartItem.quantity * cartItem.itemPrice,
      0
    );

    orderBody.totalPrice = totalPrice.toFixed(2);

    const sellerId = cartItemsWithDetails[0].sellerId;
    const admin = new mongoose.Types.ObjectId();
    const entityId = new mongoose.Types.ObjectId();
    const seller = await User.findById(sellerId);
    const user = await User.findById(orderBody.userId);

    const emailConfirmation = await fs.promises.readFile(
      path.join(__dirname, "..", "emails", "confirmationOrder.html"),
      "utf-8"
    );
    const emailNotifySeller = await fs.promises.readFile(
      path.join(__dirname, "..", "emails", "orderNotifySeller.html"),
      "utf-8"
    );
    const cartItemsHTML = cartItemsWithDetails
      .map(generateCartItemHTML)
      .join("");

    const mailOptionsUser = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Order Confirmation",
      html: emailConfirmation
        .replace("${cartItemsWithDetails}", `<ul>${cartItemsHTML}</ul>`)
        .replace("${totalPrice}", totalPrice.toFixed(2)),
    };

    const mailOptionSeller = {
      from: process.env.EMAIL_FROM,
      to: seller.email,
      subject: "New Order Arrived",
      html: emailNotifySeller
        .replace("${cartItemsWithDetails}", `<ul>${cartItemsHTML}</ul>`)
        .replace("${totalPrice}", totalPrice.toFixed(2)),
    };

    const order = await Order.create(orderBody);

    if (!user) {
      throw new APIError({ status: 404, message: "User not found." });
    }

    if (!seller) {
      throw new APIError({ status: 404, message: "Seller not found." });
    }

    // Check if the order was successfully created before sending the email
    if (order) {
      if (order.isPaid === true) {
        const emailUser = await sendEmailWithNodemailer(mailOptionsUser);
        const emailSeller = await sendEmailWithNodemailer(mailOptionSeller);
        const notification = await Notification.insertNotification(
          sellerId,
          admin,
          "Order Notification",
          "Got new order",
          "Product order",
          entityId
        );
        if (!emailUser) {
          throw new APIError({
            status: 500,
            message: "Failed to send email to user.",
          });
        }
        if (!emailSeller) {
          throw new APIError({
            status: 500,
            message: "Failed to send email to seller.",
          });
        }
      }
    }

    if (!order) {
      throw new APIError({ status: 404, message: "Order not found." });
    }
    return order;
  },
};

export default orderService;
