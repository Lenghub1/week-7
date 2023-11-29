import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    cartItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        itemPrice: {
          type: Number,
        },
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit_card", "cash_on_delivery"],
    },
    paymentDetails: {
      type: Object,
      required: true,
    },

    itemPrice: {
      type: Number,
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipping: [
      {
        address: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Address",
          required: true,
        },
        status: {
          type: String,
          enum: [
            "pending",
            "approved",
            "shipped",
            "cancelled",
            "delivered",
            "refunded",
          ],
          default: "pending",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
