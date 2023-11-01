import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      promotCode: {
        type: String,
      },
      totalAmout: {
        type: Number,
        required: true,
      },
    },
  ],
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
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
