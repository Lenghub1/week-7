import Order from "@/models/order.model.js";
import APIError from "@/utils/APIError.js";
import sendEmailWithNodemailer from "@/utils/email.js";
import User from "@/models/user.model.js";
import Notification from "@/models/notification.model.js";
import {
  generateCartItemHTML,
  generateCartItemHTMLRow,
} from "@/utils/emailTemplate.js";
import mongoose from "mongoose";
import Address from "@/models/address.model.js";
import { dialogflowService } from "@/utils/dialogflow.js";
import dotenv from "dotenv";

import {
  getEmailTemplate,
  getOrderDetails,
  getEmailSubjectAndBody,
  sendEmail,
} from "@/utils/emailHelper.js";
import Product from "@/models/product.model.js";
dotenv.config();

const orderService = {
  getAllOrders: async () => {
    const orders = await Order.find({});
    if (!orders)
      throw new APIError({ status: 404, message: "Order not found." });
    return orders;
  },

  getOrder: async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order)
      throw new APIError({ status: 404, message: "Order not found." });
    return order;
  },

  updateOrder: async (orderId, orderBody) => {
    const order = await Order.findByIdAndUpdate(orderId, orderBody, {
      new: true,
    });
    if (!order)
      throw new APIError({ status: 404, message: "Order not found." });

    const cartItemsWithDetails = await Promise.all(
      order.cartItems.map(getOrderDetails)
    );
    const cartItemsHTML = cartItemsWithDetails
      .map(generateCartItemHTMLRow)
      .join("");

    const { status } = order.shipping;
    const user = await User.findById(order.userId);
    const address = await Address.findById(order.shipping.address);

    const [emailSubject, emailBody] = await getEmailSubjectAndBody(
      status,
      order,
      user,
      address,
      cartItemsHTML
    );

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: emailSubject,
      html: emailBody,
    };

    await sendEmail(status, mailOptions);

    return order;
  },
  userUpdateOrder: async (orderId, orderBody) => {
    const order = await Order.findById(orderId);
    if (!order)
      throw new APIError({ status: 404, message: "Order not found." });
    if (
      orderBody.shipping.status === "cancelled" &&
      order.shipping.status === "pending"
    ) {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { "shipping.status": "cancelled" },
        { new: true }
      );

      if (!updatedOrder) {
        throw new APIError({ status: 404, message: "Order not found." });
      }

      const cartItemsWithDetails = await Promise.all(
        updatedOrder.cartItems.map(getOrderDetails)
      );
      const cartItemsHTML = cartItemsWithDetails
        .map(generateCartItemHTMLRow)
        .join("");

      const { status } = updatedOrder.shipping;
      const seller = await User.findById(cartItemsWithDetails[0]?.sellerId);
      const address = await Address.findById(updatedOrder.shipping.address);

      const [emailSubject, emailBody] = await getEmailSubjectAndBody(
        status,
        updatedOrder,
        seller,
        address,
        cartItemsHTML
      );

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: seller.email,
        subject: emailSubject,
        html: emailBody,
      };

      await sendEmail(status, mailOptions);
      console.log(updatedOrder);

      return updatedOrder;
    } else {
      throw new APIError({
        status: 403,
        message: "You don't have permission to perform this action.",
      });
    }
  },
  getSellerOrder: async () => {
    try {
      const orders = await Order.find({});
      const seller = [];

      // Check if orders exist
      if (!orders || orders.length === 0) {
        throw new APIError({
          status: 404,
          message: "Seller orders not found.",
        });
      }

      for (const order of orders) {
        if (order.cartItems && order.cartItems.length > 0) {
          for (const item of order.cartItems) {
            const product = await Product.findById(item.productId);
            seller.push(product.sellerId);
          }
        }
      }

      return seller;
    } catch (error) {
      // Handle errors here
      console.error(error);
      throw error; // You may want to handle or customize the error further
    }
  },
  deleteOrder: async (orderId) => {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order)
      throw new APIError({ status: 404, message: "Order not found." });
    return order;
  },

  createOrder: async (orderBody) => {
    const cartItemsWithDetails = await Promise.all(
      orderBody.cartItems.map(getOrderDetails)
    );

    const totalPrice = cartItemsWithDetails.reduce(
      (total, cartItem) => total + cartItem.quantity * cartItem.itemPrice,
      0
    );
    orderBody.totalPrice = totalPrice.toFixed(2);

    const [seller, user] = await Promise.all([
      User.findById(cartItemsWithDetails[0]?.sellerId),
      User.findById(orderBody.userId),
    ]);

    const [emailConfirmation, emailNotifySeller] = await Promise.all([
      getEmailTemplate("confirmationOrder"),
      getEmailTemplate("orderNotifySeller"),
    ]);

    const cartItemsHTML = cartItemsWithDetails
      .map(generateCartItemHTML)
      .join("");

    const mailOptionsUser = {
      from: process.env.EMAIL_FROM,
      to: user?.email,
      subject: "Order Confirmation",
      html: emailConfirmation
        .replace("${cartItemsWithDetails}", `<ul>${cartItemsHTML}</ul>`)
        .replace("${totalPrice}", totalPrice.toFixed(2)),
    };

    const mailOptionSeller = {
      from: process.env.EMAIL_FROM,
      to: seller?.email,
      subject: "New Order Arrived",
      html: emailNotifySeller
        .replace("${cartItemsWithDetails}", `<ul>${cartItemsHTML}</ul>`)
        .replace("${totalPrice}", totalPrice.toFixed(2)),
    };

    const order = await Order.create(orderBody);
    dialogflowService.addEntityValues(process.env.UNQILD, [
      order.tracking_number,
    ]);

    if (user && seller && order.isPaid) {
      const [emailUser, emailSeller] = await Promise.all([
        sendEmailWithNodemailer(mailOptionsUser),
        sendEmailWithNodemailer(mailOptionSeller),
      ]);

      await Notification.insertNotification(
        seller._id,
        new mongoose.Types.ObjectId(),
        "Order Notification",
        "Got new order",
        "Product order",
        new mongoose.Types.ObjectId()
      );

      if (!emailUser || !emailSeller) {
        throw new APIError({
          status: 500,
          message: "Failed to send email to user or seller.",
        });
      }
    }

    return order;
  },
};

export default orderService;
