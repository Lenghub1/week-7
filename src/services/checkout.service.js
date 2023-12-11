import APIError from "../utils/APIError.js";
import dotenv from "dotenv";
import paypal from "paypal-rest-sdk";

paypal.configure({
  mode: "sandbox",
  client_id: "CLIENT_ID",
  client_secret: "CLIENT_SECRET",
});

exports.createPayment = function (paymentData) {
  return new Promise((resolve, reject) => {
    const payment = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
      },
      transactions: [
        {
          amount: {
            currency: "USD",
            total: paymentData.totalPrice,
          },
          description: paymentData.description,
        },
      ],
    };

    paypal.payment.create(payment, function (error, payment) {
      if (error) {
        reject(error);
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            resolve(payment.links[i].href);
          }
        }
      }
    });
  });
};

exports.executePayment = function (paymentId, payerId) {
  return new Promise((resolve, reject) => {
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: paymentId.totalPrice,
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      }
    );
  });
};
