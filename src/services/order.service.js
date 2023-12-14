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
